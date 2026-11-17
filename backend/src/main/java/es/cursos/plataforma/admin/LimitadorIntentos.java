package es.cursos.plataforma.admin;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Bloquea el inicio de sesión desde una IP tras {@value #MAX_FALLOS} fallos seguidos durante 15 minutos.
 * Uso: {@link #intentar} reserva el intento de forma atómica ANTES de comprobar la contraseña y
 * {@link #fallo}/{@link #exito} lo resuelven; así las peticiones simultáneas también cuentan para el límite.
 * En memoria: se pierde al reiniciar, suficiente para un único administrador y una sola instancia.
 */
@Component
public class LimitadorIntentos {

    static final int MAX_FALLOS = 5;
    static final Duration BLOQUEO = Duration.ofMinutes(15);

    /**
     * fallos seguidos; enCurso = intentos reservados aún sin resolver; ultimo = última actividad;
     * bloqueadoHasta = null si no está bloqueada.
     */
    private record Estado(int fallos, int enCurso, Instant ultimo, Instant bloqueadoHasta) {
    }

    private final Clock reloj;
    private final Map<String, Estado> estados = new ConcurrentHashMap<>();

    public LimitadorIntentos(Clock reloj) {
        this.reloj = reloj;
    }

    /** Consulta sin reservar: ¿está la IP bloqueada? */
    public boolean permitido(String ip) {
        Instant ahora = reloj.instant();
        Estado e = estados.computeIfPresent(ip, (k, v) -> caducado(v, ahora) ? null : v);
        return e == null || e.bloqueadoHasta() == null;
    }

    /**
     * Reserva un intento de forma atómica. Devuelve false si la IP está bloqueada o si los fallos más
     * los intentos en curso ya llegan al límite. Cada reserva aceptada debe resolverse con fallo o exito.
     */
    public boolean intentar(String ip) {
        Instant ahora = reloj.instant();
        boolean[] aceptado = {false};
        estados.compute(ip, (k, v) -> {
            Estado e = (v == null || caducado(v, ahora)) ? new Estado(0, 0, ahora, null) : v;
            if (e.bloqueadoHasta() != null || e.fallos() + e.enCurso() >= MAX_FALLOS) {
                return e;
            }
            aceptado[0] = true;
            return new Estado(e.fallos(), e.enCurso() + 1, ahora, null);
        });
        return aceptado[0];
    }

    /** Resuelve una reserva como fallo (también vale sin reserva previa). */
    public void fallo(String ip) {
        Instant ahora = reloj.instant();
        estados.compute(ip, (k, v) -> {
            Estado e = (v == null || caducado(v, ahora)) ? new Estado(0, 0, ahora, null) : v;
            int fallos = e.fallos() + 1;
            Instant bloqueo = fallos >= MAX_FALLOS ? ahora.plus(BLOQUEO) : e.bloqueadoHasta();
            return new Estado(fallos, Math.max(0, e.enCurso() - 1), ahora, bloqueo);
        });
    }

    /** Resuelve una reserva como acierto: la IP vuelve a empezar de cero. */
    public void exito(String ip) {
        estados.remove(ip);
    }

    /**
     * Un bloqueo vencido, o una IP sin bloqueo y sin actividad en 15 minutos, se olvida
     * (también libera reservas que nunca se resolvieron).
     */
    private static boolean caducado(Estado e, Instant ahora) {
        if (e.bloqueadoHasta() != null) {
            return !ahora.isBefore(e.bloqueadoHasta());
        }
        return !ahora.isBefore(e.ultimo().plus(BLOQUEO));
    }
}
