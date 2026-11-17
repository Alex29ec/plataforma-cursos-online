package es.cursos.plataforma.pedido.dto;

import java.util.UUID;

public record PedidoCreadoDto(UUID pedidoId, String urlPago) {
}
