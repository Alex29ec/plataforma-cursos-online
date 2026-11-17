package es.cursos.plataforma.pago;

import com.stripe.Stripe;
import es.cursos.plataforma.ApoyoTests;
import es.cursos.plataforma.pedido.EstadoPedido;
import es.cursos.plataforma.pedido.Pedido;
import es.cursos.plataforma.pedido.PedidoRepository;
import es.cursos.plataforma.pedido.PedidoService;
import es.cursos.plataforma.pedido.dto.DatosAlumnoDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(ApoyoTests.class)
@TestPropertySource(properties = {
        "app.pagos.proveedor=stripe",
        "app.stripe.secret-key=sk_test_dummy",
        "app.stripe.webhook-secret=whsec_test"
})
class StripeWebhookControllerTest {

    static final String SECRETO = "whsec_test";

    @Autowired
    MockMvc mvc;
    @Autowired
    ApoyoTests apoyo;
    @Autowired
    PedidoService pedidoService;
    @Autowired
    PedidoRepository pedidos;
    @MockitoBean
    ProveedorPago proveedor;

    String sesionId;
    UUID pedidoId;

    @BeforeEach
    void pedidoPendiente() {
        sesionId = "cs_test_" + UUID.randomUUID().toString().replace("-", "");
        when(proveedor.crearSesion(any())).thenReturn(new SesionPago(sesionId, "https://checkout.stripe.com/c/pay/x"));
        pedidoId = pedidoService.crear(apoyo.intentoAprobado(),
                new DatosAlumnoDto("Ana", "García", "12345678Z", "ana@example.com", true)).pedidoId();
    }

    String evento(String tipo, String paymentStatus) {
        return """
                {"id":"evt_%s","object":"event","api_version":"%s","created":1700000000,"type":"%s",
                 "data":{"object":{"id":"%s","object":"checkout.session","payment_status":"%s","client_reference_id":"%s"}}}
                """.formatted(UUID.randomUUID(), Stripe.API_VERSION, tipo, sesionId, paymentStatus, pedidoId);
    }

    static String firma(String payload, String secreto) throws Exception {
        long ts = System.currentTimeMillis() / 1000;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String v1 = HexFormat.of().formatHex(mac.doFinal((ts + "." + payload).getBytes(StandardCharsets.UTF_8)));
        return "t=" + ts + ",v1=" + v1;
    }

    void enviar(String payload, String firma, int estadoEsperado) throws Exception {
        mvc.perform(post("/api/pagos/stripe/webhook").contentType(MediaType.APPLICATION_JSON)
                        .header("Stripe-Signature", firma).content(payload))
                .andExpect(status().is(estadoEsperado));
    }

    EstadoPedido estado() {
        return pedidos.findById(pedidoId).map(Pedido::getEstado).orElseThrow();
    }

    @Test
    void firmaValidaCheckoutCompletadoMarcaPagado() throws Exception {
        String payload = evento("checkout.session.completed", "paid");
        enviar(payload, firma(payload, SECRETO), 200);
        assertThat(estado()).isIn(EstadoPedido.PAGADO, EstadoPedido.EMITIDO);
    }

    @Test
    void firmaInvalidaDevuelve400YNoCambiaEstado() throws Exception {
        String payload = evento("checkout.session.completed", "paid");
        enviar(payload, firma(payload, "whsec_otro"), 400);
        enviar(payload, "basura", 400);
        assertThat(estado()).isEqualTo(EstadoPedido.PENDIENTE_PAGO);
    }

    @Test
    void sesionCompletadaSinPagarNoMarcaPagado() throws Exception {
        String payload = evento("checkout.session.completed", "unpaid");
        enviar(payload, firma(payload, SECRETO), 200);
        assertThat(estado()).isEqualTo(EstadoPedido.PENDIENTE_PAGO);
    }

    @Test
    void otroTipoDeEventoSeIgnora() throws Exception {
        String payload = evento("checkout.session.expired", "unpaid");
        enviar(payload, firma(payload, SECRETO), 200);
        assertThat(estado()).isEqualTo(EstadoPedido.PENDIENTE_PAGO);
    }

    @Test
    void pagoDiferidoConfirmadoMarcaPagado() throws Exception {
        String pendiente = evento("checkout.session.completed", "unpaid");
        enviar(pendiente, firma(pendiente, SECRETO), 200);
        assertThat(estado()).isEqualTo(EstadoPedido.PENDIENTE_PAGO);

        String confirmado = evento("checkout.session.async_payment_succeeded", "paid");
        enviar(confirmado, firma(confirmado, SECRETO), 200);
        assertThat(estado()).isIn(EstadoPedido.PAGADO, EstadoPedido.EMITIDO);
    }

    @Test
    void sesionDesconocidaDevuelve200ParaQueStripeNoReintente() throws Exception {
        sesionId = "cs_test_de_otro_producto";
        String payload = evento("checkout.session.completed", "paid");
        enviar(payload, firma(payload, SECRETO), 200);
    }

    @Test
    void eventoRepetidoNoFalla() throws Exception {
        String payload = evento("checkout.session.completed", "paid");
        enviar(payload, firma(payload, SECRETO), 200);
        enviar(payload, firma(payload, SECRETO), 200);
        assertThat(estado()).isIn(EstadoPedido.PAGADO, EstadoPedido.EMITIDO);
    }
}
