package es.cursos.plataforma.diploma;

import es.cursos.plataforma.pedido.PedidoPagadoEvent;
import es.cursos.plataforma.pedido.PedidoRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Lanza la emision cuando el pago ya esta confirmado y guardado. */
@Component
public class EmisionListener {

    private final PedidoRepository pedidos;
    private final EmisorDiplomas emisor;

    public EmisionListener(PedidoRepository pedidos, EmisorDiplomas emisor) {
        this.pedidos = pedidos;
        this.emisor = emisor;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void alPagar(PedidoPagadoEvent evento) {
        pedidos.findParaActualizar(evento.pedidoId()).ifPresent(emisor::emitir);
    }
}
