package es.cursos.plataforma.admin;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminCursosTest {

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
    void limpiar() {
        for (Long id : creados) {
            jdbc.update("DELETE FROM pregunta_opcion WHERE pregunta_id IN (SELECT id FROM pregunta WHERE curso_id = ?)", id);
            jdbc.update("DELETE FROM pregunta WHERE curso_id = ?", id);
            jdbc.update("DELETE FROM tema WHERE curso_id = ?", id);
            jdbc.update("DELETE FROM curso WHERE id = ?", id);
        }
    }

    String titulo() {
        return "Curso Test " + UUID.randomUUID().toString().substring(0, 8);
    }

    JsonNode crear(String titulo) throws Exception {
        String body = mvc.perform(post("/api/admin/cursos").session(s).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"" + titulo + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode n = json.readTree(body);
        creados.add(n.get("id").asLong());
        return n;
    }

    String datos(JsonNode c, String slug, int horas, int precio, int nota, int numPreguntas) {
        return "{\"slug\":\"" + slug + "\",\"titulo\":\"" + c.get("titulo").asText() + "\",\"resumen\":\"r\","
                + "\"descripcion\":\"d\",\"horas\":" + horas + ",\"precioCentimos\":" + precio
                + ",\"notaMinima\":" + nota + ",\"numPreguntas\":" + numPreguntas + ",\"orden\":100}";
    }

    ResultActions actualizar(JsonNode c, String body) throws Exception {
        return mvc.perform(put("/api/admin/cursos/" + c.get("id").asLong()).session(s).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    ResultActions estado(JsonNode c, String estado) throws Exception {
        return mvc.perform(put("/api/admin/cursos/" + c.get("id").asLong() + "/estado").session(s).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"" + estado + "\"}"));
    }

    void contenido(JsonNode c, int temas, int preguntas) {
        long id = c.get("id").asLong();
        for (int i = 1; i <= temas; i++) {
            jdbc.update("INSERT INTO tema (curso_id, orden, titulo, contenido) VALUES (?, ?, 'T', 'C')", id, i);
        }
        for (int i = 0; i < preguntas; i++) {
            jdbc.update("INSERT INTO pregunta (curso_id, enunciado, correcta, activa) VALUES (?, ?, 0, TRUE)", id, "P" + i);
            Long pid = jdbc.queryForObject("SELECT MAX(id) FROM pregunta WHERE curso_id = ?", Long.class, id);
            jdbc.update("INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES (?, 0, 'a')", pid);
            jdbc.update("INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES (?, 1, 'b')", pid);
        }
    }

    @Test
    void crearCursoQuedaEnBorradorConValoresPorDefecto() throws Exception {
        String t = titulo();
        JsonNode c = crear(t);
        assertThat(c.get("estado").asText()).isEqualTo("BORRADOR");
        assertThat(c.get("horas").asInt()).isEqualTo(10);
        assertThat(c.get("precioCentimos").asInt()).isEqualTo(1990);
        assertThat(c.get("notaMinima").asInt()).isEqualTo(75);
        assertThat(c.get("numPreguntas").asInt()).isEqualTo(20);
        assertThat(c.get("orden").asInt()).isEqualTo(100);
        assertThat(c.get("slug").asText()).isEqualTo(Slugs.desde(t));
        String catalogo = mvc.perform(get("/api/cursos")).andReturn().getResponse().getContentAsString();
        assertThat(catalogo).doesNotContain(c.get("slug").asText());
        mvc.perform(get("/api/admin/cursos/" + c.get("id").asLong()).session(s))
                .andExpect(status().isOk()).andExpect(jsonPath("$.titulo").value(t));
    }

    @Test
    void listaIncluyeContadores() throws Exception {
        JsonNode c = crear(titulo());
        contenido(c, 2, 3);
        String body = mvc.perform(get("/api/admin/cursos").session(s))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode fila = null;
        for (JsonNode n : json.readTree(body)) {
            if (n.get("id").asLong() == c.get("id").asLong()) fila = n;
        }
        assertThat(fila).isNotNull();
        assertThat(fila.get("temas").asInt()).isEqualTo(2);
        assertThat(fila.get("preguntasActivas").asLong()).isEqualTo(3);
    }

    @Test
    void dosCursosConMismoTituloTienenSlugsDistintos() throws Exception {
        String t = titulo();
        JsonNode a = crear(t);
        JsonNode b = crear(t);
        assertThat(b.get("slug").asText()).isEqualTo(a.get("slug").asText() + "-2");
    }

    @Test
    void cambiarSlugAUnoExistenteDa409() throws Exception {
        JsonNode a = crear(titulo());
        JsonNode b = crear(titulo());
        actualizar(b, datos(b, a.get("slug").asText(), 10, 1990, 75, 20)).andExpect(status().isConflict());
        actualizar(b, datos(b, "nuevo-" + b.get("slug").asText(), 12, 2500, 80, 10))
                .andExpect(status().isOk()).andExpect(jsonPath("$.horas").value(12));
    }

    @Test
    void slugNoEditableFueraDeBorrador() throws Exception {
        JsonNode c = crear(titulo());
        contenido(c, 1, 20);
        estado(c, "PUBLICADO").andExpect(status().isOk());
        actualizar(c, datos(c, "otro-" + c.get("slug").asText(), 10, 1990, 75, 20)).andExpect(status().isConflict());
        actualizar(c, datos(c, c.get("slug").asText(), 11, 1990, 75, 20)).andExpect(status().isOk());
    }

    @Test
    void datosInvalidosDan400() throws Exception {
        JsonNode c = crear(titulo());
        String slug = c.get("slug").asText();
        actualizar(c, datos(c, slug, 0, 1990, 75, 20)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.horas").exists());
        actualizar(c, datos(c, slug, 10, -1, 75, 20)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.precioCentimos").exists());
        actualizar(c, datos(c, slug, 10, 1990, 101, 20)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.notaMinima").exists());
        actualizar(c, datos(c, "Mal Slug", 10, 1990, 75, 20)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.slug").exists());
    }

    @Test
    void publicarSinTemasDa409ConMotivo() throws Exception {
        JsonNode c = crear(titulo());
        contenido(c, 0, 25);
        estado(c, "PUBLICADO").andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Añade al menos un tema"));
    }

    @Test
    void publicarConPocasPreguntasDa409() throws Exception {
        JsonNode c = crear(titulo());
        contenido(c, 1, 5);
        estado(c, "PUBLICADO").andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Hay 5 preguntas activas y el examen usa 20"));
    }

    @Test
    void publicarCompletoFunciona() throws Exception {
        JsonNode c = crear(titulo());
        contenido(c, 1, 20);
        estado(c, "PUBLICADO").andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("PUBLICADO"));
        String catalogo = mvc.perform(get("/api/cursos")).andReturn().getResponse().getContentAsString();
        assertThat(catalogo).contains(c.get("slug").asText());
    }

    @Test
    void subirNumPreguntasDeUnPublicadoPorEncimaDeLasActivasDa409() throws Exception {
        JsonNode c = crear(titulo());
        contenido(c, 1, 20);
        estado(c, "PUBLICADO").andExpect(status().isOk());
        actualizar(c, datos(c, c.get("slug").asText(), 10, 1990, 75, 21)).andExpect(status().isConflict());
        actualizar(c, datos(c, c.get("slug").asText(), 10, 1990, 75, 20)).andExpect(status().isOk());
    }

    @Test
    void proximamenteNoExigeContenido() throws Exception {
        JsonNode c = crear(titulo());
        estado(c, "PROXIMAMENTE").andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("PROXIMAMENTE"));
    }

    @Test
    void cursoInexistenteDa404() throws Exception {
        mvc.perform(get("/api/admin/cursos/999999").session(s)).andExpect(status().isNotFound());
    }

    @Test
    void tituloLargoDaSlugsDistintosDentroDelLimite() throws Exception {
        String t = "x".repeat(120);
        JsonNode a = crear(t);
        JsonNode b = crear(t);
        assertThat(a.get("slug").asText().length()).isLessThanOrEqualTo(100);
        assertThat(b.get("slug").asText().length()).isLessThanOrEqualTo(100);
        assertThat(b.get("slug").asText()).isNotEqualTo(a.get("slug").asText());
    }
}
