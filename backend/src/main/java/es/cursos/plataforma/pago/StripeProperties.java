package es.cursos.plataforma.pago;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Claves de Stripe. Vienen de STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET; nunca en el repositorio. */
@ConfigurationProperties("app.stripe")
public record StripeProperties(String secretKey, String webhookSecret) {

    static String exigir(String valor, String variable) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalStateException(
                    "Falta la variable de entorno " + variable + " (obligatoria con app.pagos.proveedor=stripe)");
        }
        return valor;
    }
}
