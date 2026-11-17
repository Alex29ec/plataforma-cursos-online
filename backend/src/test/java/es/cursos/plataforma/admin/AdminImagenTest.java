package es.cursos.plataforma.admin;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminImagenTest {

    @TempDir
    static Path uploads;

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("app.uploads-dir", () -> uploads.toString());
    }

    static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};

    @Autowired
    MockMvc mvc;
    @Autowired
    JdbcTemplate jdbc;
    @Autowired
    ObjectMapper json;

    MockHttpSession s;
    final List<Long> creados = new ArrayList<>();

    @BeforeEach
    void entrar() throws Exception {
        s = AdminTestSoporte.login(mvc);
    }

    @AfterEach
    void limpiar() throws Exception {
        for (Long id : creados) {
            jdbc.update("DELETE FROM curso WHERE id = ?", id);
        }
        try (Stream<Path> f = Files.list(uploads)) {
            for (Path p : f.toList()) {
                Files.deleteIfExists(p);
            }
        }
    }

    long crear() throws Exception {
        String body = mvc.perform(post("/api/admin/cursos").session(s).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Curso Img " + UUID.randomUUID().toString().substring(0, 8) + "\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long id = json.readTree(body).get("id").asLong();
        creados.add(id);
        return id;
    }

    static byte[] png(int tam) {
        return Arrays.copyOf(PNG, tam);
    }

    MvcResult subir(long id, byte[] datos) throws Exception {
        return mvc.perform(multipart("/api/admin/cursos/" + id + "/imagen")
                .file(new MockMultipartFile("fichero", "foto.jpg", "image/jpeg", datos))
                .session(s).with(csrf())).andReturn();
    }

    long ficheros() throws Exception {
        try (Stream<Path> f = Files.list(uploads)) {
            return f.count();
        }
    }

    @Test
    void subirPngValidoYServirlo() throws Exception {
        long id = crear();
        MvcResult r = subir(id, png(100));
        assertThat(r.getResponse().getStatus()).isEqualTo(200);
        JsonNode n = json.readTree(r.getResponse().getContentAsString());
        String url = n.get("imagenUrl").asText();
        assertThat(url).startsWith("/api/imagenes/").endsWith(".png");
        assertThat(ficheros()).isEqualTo(1);

        MvcResult g = mvc.perform(get(url)).andExpect(status().isOk())
                .andExpect(content().contentType("image/png")).andReturn();
        assertThat(g.getResponse().getHeader("Cache-Control")).contains("max-age=86400");
        assertThat(g.getResponse().getContentAsByteArray()).hasSize(100);
    }

    @Test
    void reemplazarBorraLaAnterior() throws Exception {
        long id = crear();
        subir(id, png(50));
        subir(id, png(60));
        assertThat(ficheros()).isEqualTo(1);
    }

    @Test
    void subirHtmlSeRechazaYNoQuedaFichero() throws Exception {
        long id = crear();
        MvcResult r = subir(id, "<html>x</html>".getBytes(StandardCharsets.UTF_8));
        assertThat(r.getResponse().getStatus()).isEqualTo(400);
        assertThat(ficheros()).isZero();
    }

    @Test
    void masDeCincoMbSeRechaza() throws Exception {
        long id = crear();
        MvcResult r = subir(id, png(5 * 1024 * 1024 + 1));
        assertThat(r.getResponse().getStatus()).isEqualTo(400);
        assertThat(r.getResponse().getContentAsString()).contains("La imagen supera 5 MB");
        assertThat(ficheros()).isZero();
    }

    @Test
    void quitarImagenBorraElFichero() throws Exception {
        long id = crear();
        subir(id, png(50));
        mvc.perform(delete("/api/admin/cursos/" + id + "/imagen").session(s).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imagenUrl").value((Object) null));
        assertThat(ficheros()).isZero();
    }

    @Test
    void cursoInexistenteDa404() throws Exception {
        assertThat(subir(999999L, png(50)).getResponse().getStatus()).isEqualTo(404);
        assertThat(ficheros()).isZero();
    }

    @Test
    void sinSesionDa401() throws Exception {
        mvc.perform(multipart("/api/admin/cursos/1/imagen")
                        .file(new MockMultipartFile("fichero", "a.png", "image/png", png(50))).with(csrf()))
                .andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/admin/cursos/1/imagen").with(csrf())).andExpect(status().isUnauthorized());
    }

    @Test
    void imagenInexistenteODeNombreInvalidoDa404() throws Exception {
        mvc.perform(get("/api/imagenes/" + UUID.randomUUID() + ".png")).andExpect(status().isNotFound());
        mvc.perform(get("/api/imagenes/passwd")).andExpect(status().isNotFound());
    }
}
