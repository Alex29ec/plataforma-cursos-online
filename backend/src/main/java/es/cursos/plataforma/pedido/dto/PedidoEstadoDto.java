package es.cursos.plataforma.pedido.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import es.cursos.plataforma.pedido.EstadoPedido;

import java.util.UUID;

/** codigoDiploma y tokenDescarga solo vienen cuando el estado es EMITIDO. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PedidoEstadoDto(UUID pedidoId, EstadoPedido estado, int importeCentimos,
                              String codigoDiploma, String tokenDescarga) {
}
