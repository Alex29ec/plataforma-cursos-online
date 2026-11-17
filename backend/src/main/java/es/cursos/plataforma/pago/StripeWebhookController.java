package es.cursos.plataforma.pago;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import es.cursos.plataforma.comun.NoEncontradoException;
import es.cursos.plataforma.pedido.PedidoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/pagos/stripe")
@ConditionalOnProperty(name = "app.pagos.proveedor", havingValue = "stripe")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);
    private static final Set<String> EVENTOS_PAGO =
            Set.of("checkout.session.completed", "checkout.session.async_payment_succeeded");

    private final PedidoService pedidos;
    private final String webhookSecret;

    public StripeWebhookController(PedidoService pedidos, StripeProperties props) {
        this.pedidos = pedidos;
        this.webhookSecret = StripeProperties.exigir(props.webhookSecret(), "STRIPE_WEBHOOK_SECRET");
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody String payload,
                                        @RequestHeader(name = "Stripe-Signature", required = false) String firma) {
        Event evento;
        try {
            evento = Webhook.constructEvent(payload, firma, webhookSecret);
        } catch (SignatureVerificationException | RuntimeException e) {
            log.warn("Webhook de Stripe rechazado: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }

        // completed: pago con tarjeta (inmediato). async_payment_succeeded: metodos diferidos (p. ej. SEPA).
        if (EVENTOS_PAGO.contains(evento.getType())) {
            StripeObject objeto = evento.getDataObjectDeserializer().getObject()
                    .orElseGet(() -> deserializarSinVersion(evento));
            if (objeto instanceof Session sesion && "paid".equals(sesion.getPaymentStatus())) {
                try {
                    pedidos.marcarPagado(sesion.getId());
                } catch (NoEncontradoException e) {
                    // Sesion de otro producto de la misma cuenta: se ignora para que Stripe no reintente.
                    log.info("Webhook de Stripe para una sesión desconocida: {}", sesion.getId());
                }
            }
        }
        return ResponseEntity.ok().build();
    }

    /** Si la version de API de la cuenta no coincide con la de la libreria, se deserializa igualmente. */
    private static StripeObject deserializarSinVersion(Event evento) {
        try {
            return evento.getDataObjectDeserializer().deserializeUnsafe();
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo leer el evento de Stripe " + evento.getId(), e);
        }
    }
}
