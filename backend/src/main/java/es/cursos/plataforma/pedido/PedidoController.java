package es.cursos.plataforma.pedido;

import es.cursos.plataforma.diploma.Diploma;
import es.cursos.plataforma.diploma.DiplomaRepository;
import es.cursos.plataforma.pedido.dto.DatosAlumnoDto;
import es.cursos.plataforma.pedido.dto.PedidoCreadoDto;
import es.cursos.plataforma.pedido.dto.PedidoEstadoDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PedidoController {

    private final PedidoService pedidos;
    private final DiplomaRepository diplomas;

    public PedidoController(PedidoService pedidos, DiplomaRepository diplomas) {
        this.pedidos = pedidos;
        this.diplomas = diplomas;
    }

    @PostMapping("/intentos/{intentoId}/pedido")
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoCreadoDto crear(@PathVariable UUID intentoId, @Valid @RequestBody DatosAlumnoDto datos) {
        return pedidos.crear(intentoId, datos);
    }

    @GetMapping("/pedidos/{id}")
    public PedidoEstadoDto estado(@PathVariable UUID id) {
        Pedido p = pedidos.buscar(id);
        Optional<Diploma> d = p.getEstado() == EstadoPedido.EMITIDO ? diplomas.findByPedidoId(id) : Optional.empty();
        return new PedidoEstadoDto(p.getId(), p.getEstado(), p.getImporteCentimos(),
                d.map(Diploma::getCodigo).orElse(null), d.map(Diploma::getTokenDescarga).orElse(null));
    }
}
