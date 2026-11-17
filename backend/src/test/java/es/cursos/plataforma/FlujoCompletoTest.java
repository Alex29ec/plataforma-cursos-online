package es.cursos.plataforma;

import com.jayway.jsonpath.JsonPath;
import es.cursos.plataforma.curso.PreguntaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.stream.Collectors;

import static es.cursos.plataforma.ApoyoTests.datosAlumno;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Recorre la API como lo haria el frontend, de principio a fin. */
@SpringBootTest
@AutoConfigureMockMvc
class FlujoCompletoTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    PreguntaRepository preguntas;

    String entregar(boolean bien) throws Exception {
        String intento = mvc.perform(post("/api/cursos/manipulador-alimentos/intentos"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(intento, "$.intentoId");
        List<Integer> ids = JsonPath.read(intento, "$.preguntas[*].id");
        String respuestas = ids.stream()
                .map(p -> {
                    int correcta = preguntas.findById(p.longValue()).orElseThrow().getCorrecta();
                    return "\"" + p + "\":" + (bien ? correcta : (correcta + 1) % 4);
                })
                .collect(Collectors.joining(",", "{\"respuestas\":{", "}}"));
        mvc.perform(post("/api/intentos/" + id + "/entrega").contentType(MediaType.APPLICATION_JSON).content(respuestas))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nota").value(bien ? 100 : 0))
                .andExpect(jsonPath("$.aprobado").value(bien));
        return id;
    }

    @Test
    void alumnoApruebaPagaYDescargaDiploma() throws Exception {
        mvc.perform(get("/api/cursos/manipulador-alimentos")).andExpect(status().isOk());
        mvc.perform(get("/api/cursos/manipulador-alimentos/temas/3")).andExpect(status().isOk());

        String intento = entregar(true);
        String pedido = JsonPath.read(mvc.perform(post("/api/intentos/" + intento + "/pedido")
                        .contentType(MediaType.APPLICATION_JSON).content(datosAlumno("X1234567L", true)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(), "$.pedidoId");

        mvc.perform(get("/api/pedidos/" + pedido)).andExpect(jsonPath("$.estado").value("PENDIENTE_PAGO"));
        mvc.perform(post("/api/pagos/simulado/" + pedido + "/confirmar")).andExpect(status().isNoContent());

        String estado = mvc.perform(get("/api/pedidos/" + pedido))
                .andExpect(jsonPath("$.estado").value("EMITIDO"))
                .andReturn().getResponse().getContentAsString();
        String codigo = JsonPath.read(estado, "$.codigoDiploma");
        String token = JsonPath.read(estado, "$.tokenDescarga");

        mvc.perform(get("/api/diplomas/" + codigo + "/pdf").param("token", token))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
        mvc.perform(get("/api/verificar/" + codigo))
                .andExpect(jsonPath("$.valido").value(true))
                .andExpect(jsonPath("$.dniEnmascarado").value("***3456**"));
    }

    @Test
    void alumnoSuspendeYNoPuedePagar() throws Exception {
        String intento = entregar(false);
        mvc.perform(post("/api/intentos/" + intento + "/pedido")
                        .contentType(MediaType.APPLICATION_JSON).content(datosAlumno("12345678Z", true)))
                .andExpect(status().isConflict());
    }
}
