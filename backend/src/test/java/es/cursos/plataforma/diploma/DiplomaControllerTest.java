package es.cursos.plataforma.diploma;

import com.jayway.jsonpath.JsonPath;
import es.cursos.plataforma.ApoyoTests;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static es.cursos.plataforma.ApoyoTests.datosAlumno;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(ApoyoTests.class)
class DiplomaControllerTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    ApoyoTests apoyo;
    @Autowired
    DiplomaRepository diplomas;

    String pedidoPagado() throws Exception {
        UUID intento = apoyo.intentoAprobado();
        String body = mvc.perform(post("/api/intentos/" + intento + "/pedido").contentType(MediaType.APPLICATION_JSON)
                        .content(datosAlumno("12345678Z", true)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(body, "$.pedidoId");
        mvc.perform(post("/api/pagos/simulado/" + id + "/confirmar")).andExpect(status().isNoContent());
        return id;
    }

    String estado(String pedidoId) throws Exception {
        return mvc.perform(get("/api/pedidos/" + pedidoId)).andReturn().getResponse().getContentAsString();
    }

    @Test
    void pagoConfirmadoEmiteDiplomaYPedidoQuedaEmitido() throws Exception {
        String id = pedidoPagado();
        mvc.perform(get("/api/pedidos/" + id))
                .andExpect(jsonPath("$.estado").value("EMITIDO"))
                .andExpect(jsonPath("$.codigoDiploma").isNotEmpty())
                .andExpect(jsonPath("$.tokenDescarga").isNotEmpty());
    }

    @Test
    void confirmarDosVecesEmiteUnSoloDiploma() throws Exception {
        String id = pedidoPagado();
        mvc.perform(post("/api/pagos/simulado/" + id + "/confirmar")).andExpect(status().isNoContent());
        assertThat(diplomas.findAll().stream().filter(d -> d.getPedido().getId().toString().equals(id)))
                .hasSize(1);
    }

    @Test
    void descargaConTokenCorrectoDevuelvePdf() throws Exception {
        String e = estado(pedidoPagado());
        String codigo = JsonPath.read(e, "$.codigoDiploma");
        String token = JsonPath.read(e, "$.tokenDescarga");
        byte[] pdf = mvc.perform(get("/api/diplomas/" + codigo + "/pdf").param("token", token))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=\"diploma-" + codigo + ".pdf\""))
                .andReturn().getResponse().getContentAsByteArray();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    void descargaSinTokenOConTokenMaloDevuelve404() throws Exception {
        String codigo = JsonPath.read(estado(pedidoPagado()), "$.codigoDiploma");
        mvc.perform(get("/api/diplomas/" + codigo + "/pdf")).andExpect(status().isNotFound());
        mvc.perform(get("/api/diplomas/" + codigo + "/pdf").param("token", "malo")).andExpect(status().isNotFound());
        mvc.perform(get("/api/diplomas/MA-ZZZZ-ZZZZ/pdf").param("token", "malo")).andExpect(status().isNotFound());
    }

    @Test
    void verificarCodigoValidoEnMinusculasConEspacios() throws Exception {
        String codigo = JsonPath.read(estado(pedidoPagado()), "$.codigoDiploma");
        String body = mvc.perform(get("/api/verificar/ " + codigo.toLowerCase() + " "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valido").value(true))
                .andExpect(jsonPath("$.codigo").value(codigo))
                .andExpect(jsonPath("$.titular").value("Ana García López"))
                .andExpect(jsonPath("$.dniEnmascarado").value("***4567**"))
                .andExpect(jsonPath("$.curso").value("Curso de Manipulador de Alimentos"))
                .andExpect(jsonPath("$.horas").value(10))
                .andExpect(jsonPath("$.fechaEmision").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        assertThat(body).doesNotContain("12345678Z").doesNotContain("ana@example.com");
    }

    @Test
    void verificarCodigoInexistente() throws Exception {
        mvc.perform(get("/api/verificar/MA-ZZZZ-ZZZZ"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valido").value(false))
                .andExpect(jsonPath("$.titular").doesNotExist());
    }
}
