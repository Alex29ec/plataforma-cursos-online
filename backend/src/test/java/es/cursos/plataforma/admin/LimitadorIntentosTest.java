package es.cursos.plataforma.admin;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class LimitadorIntentosTest {

    /** Reloj que se puede adelantar a mano. */
    static class RelojMovil extends Clock {
        Instant ahora = Instant.parse("2026-11-16T10:00:00Z");

        void avanzar(Duration d) {
            ahora = ahora.plus(d);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return ahora;
        }
    }

    @Test
    void cincoFallosBloqueanQuinceMinutos() {
        RelojMovil reloj = new RelojMovil();
        LimitadorIntentos l = new LimitadorIntentos(reloj);
        for (int i = 0; i < 4; i++) {
            l.fallo("1.1.1.1");
            assertThat(l.permitido("1.1.1.1")).isTrue();
        }
        l.fallo("1.1.1.1");
        assertThat(l.permitido("1.1.1.1")).isFalse();
        assertThat(l.permitido("2.2.2.2")).isTrue();

        reloj.avanzar(Duration.ofMinutes(14));
        assertThat(l.permitido("1.1.1.1")).isFalse();
        reloj.avanzar(Duration.ofMinutes(1));
        assertThat(l.permitido("1.1.1.1")).isTrue();

        // Tras el bloqueo se empieza de cero.
        l.fallo("1.1.1.1");
        assertThat(l.permitido("1.1.1.1")).isTrue();
    }

    @Test
    void reservasSinResolverCuentanParaElLimite() {
        RelojMovil reloj = new RelojMovil();
        LimitadorIntentos l = new LimitadorIntentos(reloj);
        // Cinco peticiones simultáneas en curso: la sexta se rechaza antes de autenticar.
        for (int i = 0; i < 5; i++) {
            assertThat(l.intentar("1.1.1.1")).isTrue();
        }
        assertThat(l.intentar("1.1.1.1")).isFalse();
        assertThat(l.intentar("2.2.2.2")).isTrue();
    }

    @Test
    void reservaYFalloSumanUnSoloIntento() {
        LimitadorIntentos l = new LimitadorIntentos(new RelojMovil());
        for (int i = 0; i < 4; i++) {
            assertThat(l.intentar("1.1.1.1")).isTrue();
            l.fallo("1.1.1.1");
        }
        assertThat(l.intentar("1.1.1.1")).isTrue();
        l.fallo("1.1.1.1");
        assertThat(l.intentar("1.1.1.1")).isFalse();
        assertThat(l.permitido("1.1.1.1")).isFalse();
    }

    @Test
    void unaReservaConExitoLiberaElHueco() {
        LimitadorIntentos l = new LimitadorIntentos(new RelojMovil());
        for (int i = 0; i < 4; i++) {
            l.intentar("1.1.1.1");
        }
        assertThat(l.intentar("1.1.1.1")).isTrue();
        l.exito("1.1.1.1");
        assertThat(l.intentar("1.1.1.1")).isTrue();
    }

    @Test
    void unExitoReiniciaElContador() {
        LimitadorIntentos l = new LimitadorIntentos(new RelojMovil());
        for (int i = 0; i < 4; i++) {
            l.fallo("1.1.1.1");
        }
        l.exito("1.1.1.1");
        for (int i = 0; i < 4; i++) {
            l.fallo("1.1.1.1");
        }
        assertThat(l.permitido("1.1.1.1")).isTrue();
    }
}
