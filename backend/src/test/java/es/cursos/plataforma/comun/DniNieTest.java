package es.cursos.plataforma.comun;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DniNieTest {

    @Test
    void dniConLetraCorrectaEsValido() {
        assertThat(DniNie.esValido("12345678Z")).isTrue();
    }

    @Test
    void dniConLetraIncorrectaNoEsValido() {
        assertThat(DniNie.esValido("12345678A")).isFalse();
    }

    @Test
    void nieValido() {
        assertThat(DniNie.esValido("X1234567L")).isTrue();
        assertThat(DniNie.esValido("Y1234567X")).isTrue();
    }

    @Test
    void seNormalizaAntesDeValidar() {
        assertThat(DniNie.normalizar(" x-1234567-l ")).isEqualTo("X1234567L");
        assertThat(DniNie.esValido("x-1234567-l")).isTrue();
        assertThat(DniNie.esValido("12345678z")).isTrue();
    }

    @Test
    void vacioONuloOFormatoRaroNoEsValido() {
        assertThat(DniNie.esValido(null)).isFalse();
        assertThat(DniNie.esValido("")).isFalse();
        assertThat(DniNie.esValido("1234Z")).isFalse();
        assertThat(DniNie.esValido("ABCDEFGHZ")).isFalse();
    }

    @Test
    void enmascaraDejandoVisiblesSoloCuatroCifras() {
        assertThat(DniNie.enmascarar("12345678Z")).isEqualTo("***4567**");
        assertThat(DniNie.enmascarar("X1234567L")).isEqualTo("***3456**");
    }
}
