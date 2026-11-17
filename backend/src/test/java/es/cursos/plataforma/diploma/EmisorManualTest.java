package es.cursos.plataforma.diploma;

import com.jayway.jsonpath.JsonPath;
import es.cursos.plataforma.ApoyoTests;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static es.cursos.plataforma.ApoyoTests.datosAlumno;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(ApoyoTests.class)
@TestPropertySource(properties = "app.diplomas.emisor=manual")
class EmisorManualTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    ApoyoTests apoyo;

    @Test
    void conEmisorManualPedidoQuedaPagadoSinDiploma() throws Exception {
        String body = mvc.perform(post("/api/intentos/" + apoyo.intentoAprobado() + "/pedido")
                        .contentType(MediaType.APPLICATION_JSON).content(datosAlumno("12345678Z", true)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(body, "$.pedidoId");
        mvc.perform(post("/api/pagos/simulado/" + id + "/confirmar")).andExpect(status().isNoContent());
        mvc.perform(get("/api/pedidos/" + id))
                .andExpect(jsonPath("$.estado").value("PAGADO"))
                .andExpect(jsonPath("$.codigoDiploma").doesNotExist());
    }
}
