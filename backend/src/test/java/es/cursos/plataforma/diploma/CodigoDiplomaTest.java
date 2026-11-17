package es.cursos.plataforma.diploma;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class CodigoDiplomaTest {

    @Test
    void formatoSinCaracteresConfundibles() {
        Set<String> vistos = new HashSet<>();
        for (int i = 0; i < 1000; i++) {
            String c = CodigoDiploma.generar();
            assertThat(c).matches("^CO-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$");
            vistos.add(c);
        }
        assertThat(vistos).hasSizeGreaterThan(990);
    }

    @Test
    void normalizaCodigosAntiguosYNuevos() {
        assertThat(CodigoDiploma.normalizar(" ma-7k3p-q9xd ")).isEqualTo("MA-7K3P-Q9XD");
        assertThat(CodigoDiploma.normalizar("ma 7k3p q9xd")).isEqualTo("MA-7K3P-Q9XD");
        assertThat(CodigoDiploma.normalizar("co 7k3p q9xd")).isEqualTo("CO-7K3P-Q9XD");
        assertThat(CodigoDiploma.normalizar(null)).isEmpty();
    }
}
