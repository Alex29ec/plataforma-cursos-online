package es.cursos.plataforma.pedido;

import com.jayway.jsonpath.JsonPath;
import es.cursos.plataforma.ApoyoTests;
import es.cursos.plataforma.pago.ProveedorPago;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.UUID;

import static es.cursos.plataforma.ApoyoTests.datosAlumno;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(ApoyoTests.class)
class PedidoControllerTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    ApoyoTests apoyo;
    @Autowired
    PedidoRepository pedidos;
    @MockitoSpyBean
    ProveedorPago proveedor;

    ResultActions crearPedido(UUID intento, String body) throws Exception {
        return mvc.perform(post("/api/intentos/" + intento + "/pedido")
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    String pedidoId(UUID intento) throws Exception {
        String body = crearPedido(intento, datosAlumno("12345678Z", true))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.pedidoId");
    }

    @Test
    void pedidoSobreIntentoAprobadoDevuelveUrlPago() throws Exception {
        String body = crearPedido(apoyo.intentoAprobado(), datosAlumno("12345678z", true))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.urlPago").value(startsWith("http://localhost:4200/pago-simulado/")))
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(body, "$.pedidoId");
        mvc.perform(get("/api/pedidos/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PENDIENTE_PAGO"))
                .andExpect(jsonPath("$.importeCentimos").value(1990));
        assertThat(pedidos.findById(UUID.fromString(id)).orElseThrow().getDni()).isEqualTo("12345678Z");
    }

    @Test
    void pedidoSobreIntentoSuspendidoDevuelve409() throws Exception {
        crearPedido(apoyo.intentoSuspendido(), datosAlumno("12345678Z", true)).andExpect(status().isConflict());
        verify(proveedor, never()).crearSesion(any());
    }

    @Test
    void pedidoSobreIntentoNoEntregadoDevuelve409() throws Exception {
        crearPedido(apoyo.intentoNoEntregado(), datosAlumno("12345678Z", true)).andExpect(status().isConflict());
        verify(proveedor, never()).crearSesion(any());
    }

    @Test
    void dniInvalidoDevuelve400() throws Exception {
        crearPedido(apoyo.intentoAprobado(), datosAlumno("12345678A", true))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.dni").exists());
    }

    @Test
    void sinAceptarPrivacidadDevuelve400() throws Exception {
        crearPedido(apoyo.intentoAprobado(), datosAlumno("12345678Z", false))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.aceptaPrivacidad").exists());
    }

    @Test
    void emailInvalidoDevuelve400() throws Exception {
        String body = datosAlumno("12345678Z", true).replace("ana@example.com", "no-es-email");
        crearPedido(apoyo.intentoAprobado(), body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.email").exists());
    }

    @Test
    void intentoConPedidoPagadoDevuelve409() throws Exception {
        UUID intento = apoyo.intentoAprobado();
        String id = pedidoId(intento);
        mvc.perform(post("/api/pagos/simulado/" + id + "/confirmar")).andExpect(status().isNoContent());
        crearPedido(intento, datosAlumno("12345678Z", true)).andExpect(status().isConflict());
    }

    @Test
    void pedidoPendientePrevioSeCancelaAlCrearOtro() throws Exception {
        UUID intento = apoyo.intentoAprobado();
        String primero = pedidoId(intento);
        String segundo = pedidoId(intento);
        assertThat(segundo).isNotEqualTo(primero);
        mvc.perform(get("/api/pedidos/" + primero)).andExpect(jsonPath("$.estado").value("CANCELADO"));
        mvc.perform(get("/api/pedidos/" + segundo)).andExpect(jsonPath("$.estado").value("PENDIENTE_PAGO"));
    }

    @Test
    void confirmarPagoSimuladoPasaAPagado() throws Exception {
        String id = pedidoId(apoyo.intentoAprobado());
        mvc.perform(post("/api/pagos/simulado/" + id + "/confirmar")).andExpect(status().isNoContent());
        mvc.perform(post("/api/pagos/simulado/" + id + "/confirmar")).andExpect(status().isNoContent());
        // Sin emisor de diplomas todavia el estado es PAGADO; con emisor automatico sera EMITIDO.
        String estado = JsonPath.read(mvc.perform(get("/api/pedidos/" + id))
                .andReturn().getResponse().getContentAsString(), "$.estado");
        assertThat(estado).isIn("PAGADO", "EMITIDO");
    }

    @Test
    void pedidoInexistenteDevuelve404() throws Exception {
        mvc.perform(get("/api/pedidos/" + UUID.randomUUID())).andExpect(status().isNotFound());
    }
}
