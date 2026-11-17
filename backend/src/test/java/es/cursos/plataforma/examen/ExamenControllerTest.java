package es.cursos.plataforma.examen;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ExamenControllerTest {

    @Autowired
    MockMvc mvc;

    String crearIntento() throws Exception {
        String body = mvc.perform(post("/api/cursos/manipulador-alimentos/intentos"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.intentoId");
    }

    @Test
    void crearIntentoNoExponeCorrecta() throws Exception {
        String body = mvc.perform(post("/api/cursos/manipulador-alimentos/intentos"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.preguntas.length()").value(20))
                .andReturn().getResponse().getContentAsString();
        assertThat(body).doesNotContain("\"correcta\"");
    }

    @Test
    void entregaDosVecesDevuelve409() throws Exception {
        String id = crearIntento();
        mvc.perform(post("/api/intentos/" + id + "/entrega").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"respuestas\":{}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nota").value(0))
                .andExpect(jsonPath("$.aprobado").value(false));
        mvc.perform(post("/api/intentos/" + id + "/entrega").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"respuestas\":{}}"))
                .andExpect(status().isConflict());
    }

    @Test
    void intentoInexistenteDevuelve404() throws Exception {
        mvc.perform(post("/api/intentos/00000000-0000-0000-0000-000000000000/entrega")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"respuestas\":{}}"))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/intentos/no-es-uuid/entrega")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"respuestas\":{}}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void cursoInexistenteNoCreaIntento() throws Exception {
        mvc.perform(post("/api/cursos/nada/intentos")).andExpect(status().isNotFound());
    }
}
