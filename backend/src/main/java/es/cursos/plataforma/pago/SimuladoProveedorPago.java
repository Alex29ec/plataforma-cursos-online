package es.cursos.plataforma.pago;

import es.cursos.plataforma.pedido.Pedido;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/** Pago de demostracion: no cobra nada. Solo activo con app.pagos.proveedor=simulado. */
@Component
@ConditionalOnProperty(name = "app.pagos.proveedor", havingValue = "simulado")
public class SimuladoProveedorPago implements ProveedorPago {

    private final String frontendUrl;

    public SimuladoProveedorPago(@Value("${app.frontend-url}") String frontendUrl, Environment env) {
        if (env.matchesProfiles("prod")) {
            throw new IllegalStateException("El pago simulado no puede usarse con el perfil prod");
        }
        this.frontendUrl = frontendUrl;
    }

    @Override
    public SesionPago crearSesion(Pedido pedido) {
        return new SesionPago("SIM-" + pedido.getId(), frontendUrl + "/pago-simulado/" + pedido.getId());
    }

    @Override
    public void cancelarSesion(String referencia) {
        // En la demo no hay nada que cancelar.
    }
}
