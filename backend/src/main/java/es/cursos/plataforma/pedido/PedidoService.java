package es.cursos.plataforma.pedido;

import es.cursos.plataforma.comun.ConflictoException;
import es.cursos.plataforma.comun.DniNie;
import es.cursos.plataforma.comun.NoEncontradoException;
import es.cursos.plataforma.examen.ExamenService;
import es.cursos.plataforma.examen.IntentoExamen;
import es.cursos.plataforma.examen.IntentoRepository;
import es.cursos.plataforma.pago.ProveedorPago;
import es.cursos.plataforma.pago.SesionPago;
import es.cursos.plataforma.pago.SesionYaPagadaException;
import es.cursos.plataforma.pedido.dto.DatosAlumnoDto;
import es.cursos.plataforma.pedido.dto.PedidoCreadoDto;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PedidoService {

    private final ExamenService examen;
    private final IntentoRepository intentos;
    private final PedidoRepository pedidos;
    private final ProveedorPago proveedor;
    private final ApplicationEventPublisher eventos;

    public PedidoService(ExamenService examen, IntentoRepository intentos, PedidoRepository pedidos,
                         ProveedorPago proveedor, ApplicationEventPublisher eventos) {
        this.examen = examen;
        this.intentos = intentos;
        this.pedidos = pedidos;
        this.proveedor = proveedor;
        this.eventos = eventos;
    }

    @Transactional
    public PedidoCreadoDto crear(UUID intentoId, DatosAlumnoDto datos) {
        examen.intentoAprobado(intentoId);
        // Bloquea el intento para que dos pedidos simultaneos no se creen a la vez.
        IntentoExamen intento = intentos.findParaActualizar(intentoId)
                .orElseThrow(() -> new NoEncontradoException("Intento no encontrado"));

        for (Pedido previo : pedidos.findByIntentoIdParaActualizar(intentoId)) {
            switch (previo.getEstado()) {
                case PAGADO, EMITIDO -> throw new ConflictoException("Este examen ya tiene un diploma pagado");
                case PENDIENTE_PAGO -> cancelarPrevio(previo);
                case CANCELADO -> { }
            }
        }

        // save() hace merge porque el id ya viene asignado: hay que seguir trabajando con la instancia devuelta.
        Pedido pedido = pedidos.save(new Pedido(intento, datos.nombre().trim(), datos.apellidos().trim(),
                DniNie.normalizar(datos.dni()), datos.email().trim(), intento.getCurso().getPrecioCentimos()));
        SesionPago sesion = proveedor.crearSesion(pedido);
        pedido.asignarReferenciaPago(sesion.referencia());
        return new PedidoCreadoDto(pedido.getId(), sesion.urlPago());
    }

    /** Invalida la sesion de pago anterior para que no se pueda pagar dos veces el mismo examen. */
    private void cancelarPrevio(Pedido previo) {
        if (previo.getReferenciaPago() != null) {
            try {
                proveedor.cancelarSesion(previo.getReferenciaPago());
            } catch (SesionYaPagadaException e) {
                throw new ConflictoException(
                        "Ya has pagado este diploma; estamos confirmando el pago. Espera unos minutos.");
            }
        }
        previo.cancelar();
    }

    /**
     * Marca como pagado el pedido con esa referencia. Idempotente: si ya estaba emitido no hace nada.
     * Si estaba PAGADO sin diploma (la emision fallo), vuelve a lanzar la emision.
     * Un pedido CANCELADO que llega a pagarse (sesion antigua) tambien se respeta: el dinero se ha cobrado.
     */
    @Transactional
    public void marcarPagado(String referenciaPago) {
        Pedido pedido = pedidos.findPorReferenciaParaActualizar(referenciaPago)
                .orElseThrow(() -> new NoEncontradoException("Pedido no encontrado"));
        switch (pedido.getEstado()) {
            case PENDIENTE_PAGO, CANCELADO -> {
                pedido.marcarPagado();
                eventos.publishEvent(new PedidoPagadoEvent(pedido.getId()));
            }
            case PAGADO -> eventos.publishEvent(new PedidoPagadoEvent(pedido.getId()));
            case EMITIDO -> { }
        }
    }

    @Transactional(readOnly = true)
    public Pedido buscar(UUID pedidoId) {
        return pedidos.findById(pedidoId).orElseThrow(() -> new NoEncontradoException("Pedido no encontrado"));
    }

    @Transactional(readOnly = true)
    public String referenciaPago(UUID pedidoId) {
        return buscar(pedidoId).getReferenciaPago();
    }
}
