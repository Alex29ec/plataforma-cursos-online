package es.cursos.plataforma.imagen;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AlmacenImagenesTest {

    @TempDir
    Path dir;
    AlmacenImagenes almacen;

    @BeforeEach
    void preparar() {
        almacen = new AlmacenImagenes(dir.toString());
    }

    static byte[] con(byte[] cabecera) {
        return Arrays.copyOf(cabecera, 64);
    }

    static final byte[] JPG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
    static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
    static final byte[] WEBP = {'R', 'I', 'F', 'F', 1, 2, 3, 4, 'W', 'E', 'B', 'P'};

    @Test
    void detectaJpgPngYWebpPorBytes() {
        assertThat(almacen.guardar(con(JPG))).matches("^[0-9a-f-]{36}\\.jpg$");
        assertThat(almacen.guardar(con(PNG))).matches("^[0-9a-f-]{36}\\.png$");
        assertThat(almacen.guardar(con(WEBP))).matches("^[0-9a-f-]{36}\\.webp$");
    }

    @Test
    void guardaYLeeYBorra() {
        String n = almacen.guardar(con(PNG));
        assertThat(Files.exists(dir.resolve(n))).isTrue();
        assertThat(almacen.leer(n)).isPresent();
        almacen.borrar(n);
        assertThat(Files.exists(dir.resolve(n))).isFalse();
        assertThat(almacen.leer(n)).isEmpty();
    }

    @Test
    void htmlConExtensionJpgSeRechaza() {
        byte[] html = "<html><script>alert(1)</script></html>".getBytes(StandardCharsets.UTF_8);
        assertThatThrownBy(() -> almacen.guardar(html)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void svgSeRechaza() {
        byte[] svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"/>".getBytes(StandardCharsets.UTF_8);
        assertThatThrownBy(() -> almacen.guardar(svg)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void riffQueNoEsWebpSeRechaza() {
        byte[] wav = {'R', 'I', 'F', 'F', 1, 2, 3, 4, 'W', 'A', 'V', 'E'};
        assertThatThrownBy(() -> almacen.guardar(wav)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void vacioSeRechaza() {
        assertThatThrownBy(() -> almacen.guardar(new byte[0])).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void nombreConRutaSeRechaza() throws Exception {
        Path fuera = dir.getParent().resolve("x.jpg");
        Files.write(fuera, con(JPG));
        try {
            assertThat(almacen.leer("../x.jpg")).isEmpty();
            assertThat(almacen.leer("..\\x.jpg")).isEmpty();
            assertThat(almacen.leer("x.jpg")).isEmpty();
            assertThat(almacen.leer(null)).isEmpty();
        } finally {
            Files.deleteIfExists(fuera);
        }
    }

    @Test
    void borrarConNombreInvalidoNoTocaNada() throws Exception {
        Path fuera = dir.resolveSibling("fuera-" + System.nanoTime() + ".jpg");
        Files.write(fuera, con(JPG));
        try {
            almacen.borrar("../" + fuera.getFileName());
            assertThat(Files.exists(fuera)).isTrue();
        } finally {
            Files.deleteIfExists(fuera);
        }
    }
}
