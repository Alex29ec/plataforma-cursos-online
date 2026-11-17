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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminContenidoTest {

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
            jdbc.update("DELETE FROM intento_pregunta WHERE intento_id IN (SELECT id FROM intento_examen WHERE curso_id = ?)", id);
            jdbc.update("DELETE FROM intento_respuesta WHERE intento_id IN (SELECT id FROM intento_examen WHERE curso_id = ?)", id);
            jdbc.update("DELETE FROM intento_examen WHERE curso_id = ?", id);
            jdbc.update("DELETE FROM pregunta_opcion WHERE pregunta_id IN (SELECT id FROM pregunta WHERE curso_id = ?)", id);
            jdbc.update("DELETE FROM pregunta WHERE curso_id = ?", id);
            jdbc.update("DELETE FROM tema WHERE curso_id = ?", id);
            jdbc.update("DELETE FROM curso WHERE id = ?", id);
        }
    }

    JsonNode crearCurso() throws Exception {
        String body = mvc.perform(post("/api/admin/cursos").session(s).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Curso Contenido " + UUID.randomUUID().toString().substring(0, 8) + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode n = json.readTree(body);
        creados.add(n.get("id").asLong());
        return n;
    }

    String temas(long curso) {
        return "/api/admin/cursos/" + curso + "/temas";
    }

    String preguntas(long curso) {
        return "/api/admin/cursos/" + curso + "/preguntas";
    }

    ResultActions enviar(MockHttpServletRequestBuilder rb, String body) throws Exception {
        return mvc.perform(rb.session(s).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    JsonNode crearTema(long curso, String titulo) throws Exception {
        String r = enviar(post(temas(curso)), "{\"titulo\":\"" + titulo + "\",\"contenido\":\"contenido de " + titulo + "\"}")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(r);
    }

    JsonNode listarTemas(long curso) throws Exception {
        return json.readTree(mvc.perform(get(temas(curso)).session(s)).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
    }

    String datosPregunta(String enunciado, int opciones, int correcta) {
        StringBuilder ops = new StringBuilder();
        for (int i = 0; i < opciones; i++) {
            ops.append(i > 0 ? "," : "").append("\"op").append(i).append("\"");
        }
        return "{\"enunciado\":\"" + enunciado + "\",\"opciones\":[" + ops + "],\"correcta\":" + correcta + "}";
    }

    JsonNode crearPregunta(long curso, String enunciado) throws Exception {
        String r = enviar(post(preguntas(curso)), datosPregunta(enunciado, 3, 1))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(r);
    }

    void publicar(JsonNode curso, int numPreguntas) throws Exception {
        String datos = "{\"slug\":\"" + curso.get("slug").asText() + "\",\"titulo\":\"" + curso.get("titulo").asText()
                + "\",\"resumen\":\"r\",\"descripcion\":\"d\",\"horas\":10,\"precioCentimos\":1990,\"notaMinima\":75,"
                + "\"numPreguntas\":" + numPreguntas + ",\"orden\":100}";
        enviar(put("/api/admin/cursos/" + curso.get("id").asLong()), datos).andExpect(status().isOk());
        enviar(put("/api/admin/cursos/" + curso.get("id").asLong() + "/estado"), "{\"estado\":\"PUBLICADO\"}")
                .andExpect(status().isOk());
    }

    @Test
    void crearYEditarTemaYApareceEnLaWebSiPublicado() throws Exception {
        JsonNode c = crearCurso();
        long id = c.get("id").asLong();
        JsonNode t1 = crearTema(id, "Uno");
        JsonNode t2 = crearTema(id, "Dos");
        assertThat(t1.get("orden").asInt()).isEqualTo(1);
        assertThat(t2.get("orden").asInt()).isEqualTo(2);
        for (int i = 0; i < 2; i++) {
            crearPregunta(id, "P" + i);
        }
        publicar(c, 2);
        enviar(put(temas(id) + "/" + t1.get("id").asLong()), "{\"titulo\":\"Nuevo titulo\",\"contenido\":\"Nuevo cuerpo\"}")
                .andExpect(status().isOk()).andExpect(jsonPath("$.titulo").value("Nuevo titulo"));
        mvc.perform(get("/api/cursos/" + c.get("slug").asText() + "/temas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Nuevo titulo"))
                .andExpect(jsonPath("$.contenido").value("Nuevo cuerpo"));
    }

    @Test
    void reordenarTemas() throws Exception {
        long id = crearCurso().get("id").asLong();
        long a = crearTema(id, "A").get("id").asLong();
        long b = crearTema(id, "B").get("id").asLong();
        long c = crearTema(id, "C").get("id").asLong();
        enviar(put(temas(id) + "/orden"), "{\"ids\":[" + c + "," + a + "," + b + "]}").andExpect(status().isOk());
        JsonNode l = listarTemas(id);
        assertThat(l.get(0).get("titulo").asText()).isEqualTo("C");
        assertThat(l.get(1).get("titulo").asText()).isEqualTo("A");
        assertThat(l.get(2).get("titulo").asText()).isEqualTo("B");
        assertThat(l.get(0).get("orden").asInt()).isEqualTo(1);
        assertThat(l.get(2).get("orden").asInt()).isEqualTo(3);
        enviar(put(temas(id) + "/orden"), "{\"ids\":[" + c + "," + a + "]}").andExpect(status().isBadRequest());
        enviar(put(temas(id) + "/orden"), "{\"ids\":[" + c + "," + a + "," + a + "]}").andExpect(status().isBadRequest());
        enviar(put(temas(id) + "/orden"), "{\"ids\":[" + c + "," + a + ",999999]}").andExpect(status().isBadRequest());
    }

    @Test
    void borrarTemaRenumera() throws Exception {
        long id = crearCurso().get("id").asLong();
        long a = crearTema(id, "A").get("id").asLong();
        crearTema(id, "B");
        crearTema(id, "C");
        mvc.perform(delete(temas(id) + "/" + a).session(s).with(csrf())).andExpect(status().isNoContent());
        JsonNode l = listarTemas(id);
        assertThat(l).hasSize(2);
        assertThat(l.get(0).get("titulo").asText()).isEqualTo("B");
        assertThat(l.get(0).get("orden").asInt()).isEqualTo(1);
        assertThat(l.get(1).get("titulo").asText()).isEqualTo("C");
        assertThat(l.get(1).get("orden").asInt()).isEqualTo(2);
    }

    @Test
    void borrarUltimoTemaDeUnPublicadoDa409() throws Exception {
        JsonNode c = crearCurso();
        long id = c.get("id").asLong();
        long t = crearTema(id, "Unico").get("id").asLong();
        crearPregunta(id, "P");
        publicar(c, 1);
        mvc.perform(delete(temas(id) + "/" + t).session(s).with(csrf())).andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Añade al menos un tema"));
        assertThat(listarTemas(id)).hasSize(1);
    }

    @Test
    void preguntaConUnaOpcionOCorrectaFueraDeRangoDa400() throws Exception {
        long id = crearCurso().get("id").asLong();
        enviar(post(preguntas(id)), datosPregunta("P", 1, 0)).andExpect(status().isBadRequest());
        enviar(post(preguntas(id)), datosPregunta("P", 3, 3)).andExpect(status().isBadRequest());
        enviar(post(preguntas(id)), datosPregunta("P", 3, -1)).andExpect(status().isBadRequest());
        enviar(post(preguntas(id)), datosPregunta("P", 7, 0)).andExpect(status().isBadRequest());
        enviar(post(preguntas(id)), datosPregunta("", 3, 0)).andExpect(status().isBadRequest());
        JsonNode p = crearPregunta(id, "Valida");
        enviar(put(preguntas(id) + "/" + p.get("id").asLong()), datosPregunta("P", 2, 2)).andExpect(status().isBadRequest());
    }

    String datosPreguntaConOpciones(String enunciado, List<String> ops, int correcta) {
        String lista = ops.stream().map(o -> "\"" + o + "\"").collect(java.util.stream.Collectors.joining(","));
        return "{\"enunciado\":\"" + enunciado + "\",\"opciones\":[" + lista + "],\"correcta\":" + correcta + "}";
    }

    JsonNode leerPregunta(long curso, long pregunta) throws Exception {
        JsonNode l = json.readTree(mvc.perform(get(preguntas(curso)).session(s)).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        for (JsonNode n : l) {
            if (n.get("id").asLong() == pregunta) return n;
        }
        throw new AssertionError("pregunta no listada");
    }

    @Test
    void editarPreguntaCambiaOpcionesOrdenYCorrecta() throws Exception {
        long id = crearCurso().get("id").asLong();
        long p = crearPregunta(id, "Original").get("id").asLong();
        String url = preguntas(id) + "/" + p;

        enviar(put(url), datosPreguntaConOpciones("Editada", List.of("z", "y"), 0))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enunciado").value("Editada"))
                .andExpect(jsonPath("$.opciones.length()").value(2));
        JsonNode a = leerPregunta(id, p);
        assertThat(a.get("enunciado").asText()).isEqualTo("Editada");
        assertThat(a.get("opciones")).hasSize(2);
        assertThat(a.get("opciones").get(0).asText()).isEqualTo("z");
        assertThat(a.get("opciones").get(1).asText()).isEqualTo("y");
        assertThat(a.get("correcta").asInt()).isEqualTo(0);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM pregunta_opcion WHERE pregunta_id = ?", Integer.class, p))
                .isEqualTo(2);

        enviar(put(url), datosPreguntaConOpciones("Editada", List.of("f", "e", "d", "c", "b", "a"), 4))
                .andExpect(status().isOk());
        JsonNode b = leerPregunta(id, p);
        assertThat(b.get("opciones")).hasSize(6);
        assertThat(b.get("opciones").get(0).asText()).isEqualTo("f");
        assertThat(b.get("opciones").get(5).asText()).isEqualTo("a");
        assertThat(b.get("correcta").asInt()).isEqualTo(4);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM pregunta_opcion WHERE pregunta_id = ?", Integer.class, p))
                .isEqualTo(6);
    }

    @Test
    void editarPreguntaInactivaLaDejaInactiva() throws Exception {
        long id = crearCurso().get("id").asLong();
        long p = crearPregunta(id, "Vieja").get("id").asLong();
        mvc.perform(delete(preguntas(id) + "/" + p).session(s).with(csrf())).andExpect(status().isNoContent());
        enviar(put(preguntas(id) + "/" + p), datosPreguntaConOpciones("Corregida", List.of("a", "b"), 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activa").value(false));
        JsonNode n = leerPregunta(id, p);
        assertThat(n.get("activa").asBoolean()).isFalse();
        assertThat(n.get("enunciado").asText()).isEqualTo("Corregida");
        assertThat(n.get("opciones")).hasSize(2);
    }

    @Test
    void preguntaConSeisOpcionesSeGuarda() throws Exception {
        long id = crearCurso().get("id").asLong();
        enviar(post(preguntas(id)), datosPregunta("Seis", 6, 5)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.opciones.length()").value(6))
                .andExpect(jsonPath("$.correcta").value(5))
                .andExpect(jsonPath("$.activa").value(true));
        JsonNode l = json.readTree(mvc.perform(get(preguntas(id)).session(s)).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        assertThat(l).hasSize(1);
        assertThat(l.get(0).get("opciones").get(5).asText()).isEqualTo("op5");
    }

    @Test
    void borrarPreguntaLaDesactivaYNoSaleEnElExamen() throws Exception {
        JsonNode c = crearCurso();
        long id = c.get("id").asLong();
        crearTema(id, "T");
        long p1 = crearPregunta(id, "P1").get("id").asLong();
        long p2 = crearPregunta(id, "P2").get("id").asLong();
        publicar(c, 1);
        mvc.perform(delete(preguntas(id) + "/" + p1).session(s).with(csrf())).andExpect(status().isNoContent());
        JsonNode l = json.readTree(mvc.perform(get(preguntas(id)).session(s)).andReturn().getResponse().getContentAsString());
        assertThat(l).hasSize(2);
        assertThat(l.get(0).get("id").asLong()).isEqualTo(p2);
        assertThat(l.get(0).get("activa").asBoolean()).isTrue();
        assertThat(l.get(1).get("id").asLong()).isEqualTo(p1);
        assertThat(l.get(1).get("activa").asBoolean()).isFalse();
        // Determinista: con num_preguntas = total de preguntas (2), un filtro roto meteria siempre P1.
        // El panel no deja guardar num_preguntas > activas en un curso publicado, asi que va por SQL.
        jdbc.update("UPDATE curso SET num_preguntas = 2 WHERE id = ?", id);
        for (int i = 0; i < 5; i++) {
            String r = mvc.perform(post("/api/cursos/" + c.get("slug").asText() + "/intentos").with(csrf()))
                    .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
            JsonNode ps = json.readTree(r).get("preguntas");
            for (JsonNode p : ps) {
                assertThat(p.get("id").asLong()).isNotEqualTo(p1);
            }
            assertThat(ps).hasSize(1);
            assertThat(ps.get(0).get("id").asLong()).isEqualTo(p2);
        }
    }

    @Test
    void desactivarPorDebajoDeNumPreguntasEnPublicadoDa409() throws Exception {
        Long curso = jdbc.queryForObject("SELECT id FROM curso WHERE slug = 'manipulador-alimentos'", Long.class);
        List<Long> activas = jdbc.queryForList(
                "SELECT id FROM pregunta WHERE curso_id = ? AND activa = TRUE ORDER BY id", Long.class, curso);
        Integer num = jdbc.queryForObject("SELECT num_preguntas FROM curso WHERE id = ?", Integer.class, curso);
        assertThat(activas.size() - num).isEqualTo(10);
        try {
            for (int i = 0; i < 10; i++) {
                mvc.perform(delete(preguntas(curso) + "/" + activas.get(i)).session(s).with(csrf()))
                        .andExpect(status().isNoContent());
            }
            mvc.perform(delete(preguntas(curso) + "/" + activas.get(10)).session(s).with(csrf()))
                    .andExpect(status().isConflict());
            Boolean sigueActiva = jdbc.queryForObject("SELECT activa FROM pregunta WHERE id = ?", Boolean.class, activas.get(10));
            assertThat(sigueActiva).isTrue();
        } finally {
            for (Long pid : activas) {
                jdbc.update("UPDATE pregunta SET activa = TRUE WHERE id = ?", pid);
            }
        }
    }

    @Test
    void temaDeOtroCursoDa404() throws Exception {
        long a = crearCurso().get("id").asLong();
        long b = crearCurso().get("id").asLong();
        long tema = crearTema(a, "De A").get("id").asLong();
        long preg = crearPregunta(a, "De A").get("id").asLong();
        enviar(put(temas(b) + "/" + tema), "{\"titulo\":\"x\",\"contenido\":\"y\"}").andExpect(status().isNotFound());
        mvc.perform(delete(temas(b) + "/" + tema).session(s).with(csrf())).andExpect(status().isNotFound());
        enviar(put(preguntas(b) + "/" + preg), datosPregunta("x", 2, 0)).andExpect(status().isNotFound());
        mvc.perform(delete(preguntas(b) + "/" + preg).session(s).with(csrf())).andExpect(status().isNotFound());
        mvc.perform(get(temas(999999)).session(s)).andExpect(status().isNotFound());
    }

    @Test
    void validacionDeTema() throws Exception {
        long id = crearCurso().get("id").asLong();
        enviar(post(temas(id)), "{\"titulo\":\"\",\"contenido\":\"c\"}").andExpect(status().isBadRequest());
        enviar(post(temas(id)), "{\"titulo\":\"t\",\"contenido\":\"\"}").andExpect(status().isBadRequest());
        enviar(post(temas(id)), "{\"titulo\":\"" + "x".repeat(201) + "\",\"contenido\":\"c\"}").andExpect(status().isBadRequest());
        enviar(post(temas(id)), "{\"titulo\":\"t\",\"contenido\":\"" + "x".repeat(20001) + "\"}").andExpect(status().isBadRequest());
    }
}
