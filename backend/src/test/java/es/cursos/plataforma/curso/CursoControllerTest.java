package es.cursos.plataforma.curso;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CursoControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void cursoExistenteDevuelveDatosYTemas() throws Exception {
        mvc.perform(get("/api/cursos/manipulador-alimentos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("manipulador-alimentos"))
                .andExpect(jsonPath("$.precioCentimos").value(1990))
                .andExpect(jsonPath("$.notaMinima").value(75))
                .andExpect(jsonPath("$.numPreguntas").value(20))
                .andExpect(jsonPath("$.horas").value(10))
                .andExpect(jsonPath("$.temas.length()").value(6))
                .andExpect(jsonPath("$.temas[0].orden").value(1));
    }

    @Test
    void cursoInexistenteDevuelve404() throws Exception {
        mvc.perform(get("/api/cursos/nada")).andExpect(status().isNotFound());
    }

    @Test
    void temaDevuelveContenido() throws Exception {
        mvc.perform(get("/api/cursos/manipulador-alimentos/temas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orden").value(1))
                .andExpect(jsonPath("$.contenido").value(not(emptyOrNullString())));
    }

    @Test
    void temaInexistenteDevuelve404() throws Exception {
        mvc.perform(get("/api/cursos/manipulador-alimentos/temas/99"))
                .andExpect(status().isNotFound());
    }
}
