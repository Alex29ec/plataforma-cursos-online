package es.cursos.plataforma.pago;

import es.cursos.plataforma.pedido.PedidoService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/pagos/simulado")
@ConditionalOnProperty(name = "app.pagos.proveedor", havingValue = "simulado")
public class PagoSimuladoController {

    private final PedidoService pedidos;

    public PagoSimuladoController(PedidoService pedidos) {
        this.pedidos = pedidos;
    }

    @PostMapping("/{pedidoId}/confirmar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmar(@PathVariable UUID pedidoId) {
        pedidos.marcarPagado(pedidos.referenciaPago(pedidoId));
    }
}
