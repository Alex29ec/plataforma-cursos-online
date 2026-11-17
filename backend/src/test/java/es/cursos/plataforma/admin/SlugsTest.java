package es.cursos.plataforma.admin;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SlugsTest {

    @Test
    void quitaSignosYMinusculas() {
        assertThat(Slugs.desde("Carretilla Elevadora: Nivel 1")).isEqualTo("carretilla-elevadora-nivel-1");
    }

    @Test
    void quitaAcentosYEspaciosRepetidos() {
        assertThat(Slugs.desde("Prevención  del ACOSO")).isEqualTo("prevencion-del-acoso");
    }

    @Test
    void sinAlfanumericosDaCurso() {
        assertThat(Slugs.desde("¡¡!!")).isEqualTo("curso");
    }

    @Test
    void conSufijoNuncaSuperaCienCaracteres() {
        String base = "a".repeat(100);
        String s = Slugs.conSufijo(base, 2);
        assertThat(s).hasSize(100).endsWith("-2");
        assertThat(Slugs.conSufijo("abc", 3)).isEqualTo("abc-3");
        assertThat(Slugs.conSufijo("a".repeat(97) + "-b", 12)).doesNotContain("--").hasSizeLessThanOrEqualTo(100);
    }
}
