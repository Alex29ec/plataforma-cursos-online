package es.cursos.plataforma.pedido;

import java.util.UUID;

/** Se publica cuando un pedido pasa a PAGADO (una sola vez por pedido). */
public record PedidoPagadoEvent(UUID pedidoId) {
}
