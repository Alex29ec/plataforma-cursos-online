package es.cursos.plataforma.curso;

import com.jayway.jsonpath.JsonPath;
import es.cursos.plataforma.ApoyoTests;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static es.cursos.plataforma.ApoyoTests.datosAlumno;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(ApoyoTests.class)
class CatalogoTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    JdbcTemplate jdbc;
    @Autowired
    ApoyoTests apoyo;

    @AfterEach
    void limpiar() {
        jdbc.update("DELETE FROM curso WHERE slug IN ('borrador-x', 'pronto-x')");
        jdbc.update("UPDATE curso SET estado = 'PUBLICADO' WHERE slug = 'manipulador-alimentos'");
        jdbc.update("UPDATE pregunta SET activa = TRUE");
    }

    void insertarCurso(String slug, String estado, int orden) {
        jdbc.update("INSERT INTO curso (slug, titulo, descripcion, horas, precio_centimos, nota_minima, "
                + "num_preguntas, estado, orden) VALUES (?, ?, 'desc', 5, 1000, 75, 5, ?, ?)",
                slug, "Curso " + slug, estado, orden);
    }

    @Test
    void catalogoMuestraPublicadosYProximamenteNoBorradores() throws Exception {
        insertarCurso("borrador-x", "BORRADOR", 2);
        insertarCurso("pronto-x", "PROXIMAMENTE", 1);

        String body = mvc.perform(get("/api/cursos")).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        List<String> slugs = JsonPath.read(body, "$[*].slug");
        assertThat(slugs).contains("manipulador-alimentos", "pronto-x").doesNotContain("borrador-x");
        assertThat(slugs.indexOf("pronto-x")).isLessThan(slugs.indexOf("manipulador-alimentos"));
        mvc.perform(get("/api/cursos"))
                .andExpect(jsonPath("$[?(@.slug=='manipulador-alimentos')].estado").value("PUBLICADO"))
                .andExpect(jsonPath("$[?(@.slug=='manipulador-alimentos')].precioCentimos").value(1990))
                .andExpect(jsonPath("$[?(@.slug=='pronto-x')].estado").value("PROXIMAMENTE"));
    }

    @Test
    void cursoNoPublicadoDevuelve404() throws Exception {
        insertarCurso("borrador-x", "BORRADOR", 2);
        insertarCurso("pronto-x", "PROXIMAMENTE", 1);

        mvc.perform(get("/api/cursos/pronto-x")).andExpect(status().isNotFound());
        mvc.perform(get("/api/cursos/borrador-x")).andExpect(status().isNotFound());
        mvc.perform(post("/api/cursos/pronto-x/intentos")).andExpect(status().isNotFound());
    }

    @Test
    void examenSoloUsaPreguntasActivas() throws Exception {
        Long cursoId = jdbc.queryForObject("SELECT id FROM curso WHERE slug = 'manipulador-alimentos'", Long.class);
        List<Long> ids = jdbc.queryForList("SELECT id FROM pregunta WHERE curso_id = ? ORDER BY id", Long.class, cursoId);
        Set<Long> activas = new HashSet<>(ids.subList(0, 20));
        for (Long id : ids.subList(20, ids.size())) {
            jdbc.update("UPDATE pregunta SET activa = FALSE WHERE id = ?", id);
        }
        for (int i = 0; i < 10; i++) {
            String body = mvc.perform(post("/api/cursos/manipulador-alimentos/intentos"))
                    .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
            List<Integer> usadas = JsonPath.read(body, "$.preguntas[*].id");
            assertThat(usadas).hasSize(20);
            assertThat(usadas).allMatch(id -> activas.contains(id.longValue()));
        }
    }

    @Test
    void intentoSigueFuncionandoSiElCursoPasaABorrador() throws Exception {
        String creado = mvc.perform(post("/api/cursos/manipulador-alimentos/intentos"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String intentoId = JsonPath.read(creado, "$.intentoId");
        List<Integer> preguntaIds = JsonPath.read(creado, "$.preguntas[*].id");
        StringBuilder respuestas = new StringBuilder();
        for (Integer pid : preguntaIds) {
            int correcta = jdbc.queryForObject("SELECT correcta FROM pregunta WHERE id = ?", Integer.class, pid);
            if (respuestas.length() > 0) respuestas.append(',');
            respuestas.append('"').append(pid).append("\":").append(correcta);
        }

        jdbc.update("UPDATE curso SET estado = 'BORRADOR' WHERE slug = 'manipulador-alimentos'");

        mvc.perform(post("/api/intentos/" + intentoId + "/entrega").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"respuestas\":{" + respuestas + "}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aprobado").value(true));
        mvc.perform(post("/api/intentos/" + intentoId + "/pedido").contentType(MediaType.APPLICATION_JSON)
                        .content(datosAlumno("12345678Z", true)))
                .andExpect(status().isCreated());
    }

    @Test
    void cursoDeUnIntento() throws Exception {
        UUID intento = apoyo.intentoNoEntregado();
        mvc.perform(get("/api/intentos/" + intento + "/curso"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("manipulador-alimentos"))
                .andExpect(jsonPath("$.precioCentimos").value(1990));
    }
}
