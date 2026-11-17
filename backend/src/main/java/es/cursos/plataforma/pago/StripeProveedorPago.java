package es.cursos.plataforma.pago;

import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import es.cursos.plataforma.pedido.Pedido;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Stripe Checkout. Activo con app.pagos.proveedor=stripe. */
@Component
@ConditionalOnProperty(name = "app.pagos.proveedor", havingValue = "stripe")
public class StripeProveedorPago implements ProveedorPago {

    private final StripeClient client;
    private final String frontendUrl;

    public StripeProveedorPago(StripeProperties props, @Value("${app.frontend-url}") String frontendUrl) {
        this.client = new StripeClient(StripeProperties.exigir(props.secretKey(), "STRIPE_SECRET_KEY"));
        this.frontendUrl = frontendUrl;
    }

    @Override
    public SesionPago crearSesion(Pedido pedido) {
        String nombreCurso = pedido.getIntento().getCurso().getTitulo();
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomerEmail(pedido.getEmail())
                .setClientReferenceId(pedido.getId().toString())
                .setSuccessUrl(frontendUrl + "/pedido/" + pedido.getId())
                .setCancelUrl(frontendUrl + "/pedido/" + pedido.getId() + "/datos")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("eur")
                                .setUnitAmount((long) pedido.getImporteCentimos())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Diploma - " + nombreCurso)
                                        .build())
                                .build())
                        .build())
                .build();
        try {
            Session sesion = client.v1().checkout().sessions().create(params);
            return new SesionPago(sesion.getId(), sesion.getUrl());
        } catch (StripeException e) {
            throw new IllegalStateException("No se pudo crear la sesión de pago en Stripe", e);
        }
    }

    /** Expira la sesion de Checkout. Si ya se pago, Stripe no deja expirarla. */
    @Override
    public void cancelarSesion(String referencia) {
        try {
            Session sesion = client.v1().checkout().sessions().retrieve(referencia);
            if ("complete".equals(sesion.getStatus())) {
                throw new SesionYaPagadaException(referencia);
            }
            if ("open".equals(sesion.getStatus())) {
                client.v1().checkout().sessions().expire(referencia);
            }
        } catch (StripeException e) {
            throw new IllegalStateException("No se pudo cancelar la sesión de pago anterior en Stripe", e);
        }
    }
}
