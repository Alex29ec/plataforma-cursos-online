package es.cursos.plataforma.diploma;

import es.cursos.plataforma.pedido.EstadoPedido;
import es.cursos.plataforma.pedido.Pedido;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@ConditionalOnProperty(name = "app.diplomas.emisor", havingValue = "automatico", matchIfMissing = true)
public class EmisorPdfAutomatico implements EmisorDiplomas {

    private final DiplomaRepository diplomas;

    public EmisorPdfAutomatico(DiplomaRepository diplomas) {
        this.diplomas = diplomas;
    }

    /** Idempotente: si el pedido ya tiene diploma, no hace nada. Debe llamarse dentro de una transaccion. */
    @Override
    public void emitir(Pedido pedido) {
        if (pedido.getEstado() != EstadoPedido.PAGADO || diplomas.findByPedidoId(pedido.getId()).isPresent()) {
            return;
        }
        String codigo;
        do {
            codigo = CodigoDiploma.generar();
        } while (diplomas.existsByCodigo(codigo));
        diplomas.save(new Diploma(pedido, codigo, CodigoDiploma.token(), Instant.now()));
        pedido.marcarEmitido();
    }
}
