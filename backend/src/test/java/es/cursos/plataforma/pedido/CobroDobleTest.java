package es.cursos.plataforma.pedido;

import es.cursos.plataforma.ApoyoTests;
import es.cursos.plataforma.comun.ConflictoException;
import es.cursos.plataforma.diploma.DiplomaRepository;
import es.cursos.plataforma.pago.ProveedorPago;
import es.cursos.plataforma.pago.SesionPago;
import es.cursos.plataforma.pago.SesionYaPagadaException;
import es.cursos.plataforma.pedido.dto.DatosAlumnoDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/** Casos de la revision final: evitar cobrar dos veces y no dejar pagos sin diploma. */
@SpringBootTest
@Import(ApoyoTests.class)
class CobroDobleTest {

    static final DatosAlumnoDto DATOS = new DatosAlumnoDto("Ana", "García", "12345678Z", "ana@example.com", true);

    @Autowired
    ApoyoTests apoyo;
    @Autowired
    PedidoService pedidoService;
    @Autowired
    PedidoRepository pedidos;
    @Autowired
    DiplomaRepository diplomas;
    @Autowired
    TransactionTemplate tx;
    @MockitoBean
    ProveedorPago proveedor;

    final AtomicInteger contador = new AtomicInteger();

    @BeforeEach
    void sesionesDistintas() {
        when(proveedor.crearSesion(any())).thenAnswer(inv -> {
            String ref = "cs_test_" + UUID.randomUUID();
            return new SesionPago(ref, "https://checkout/" + contador.incrementAndGet());
        });
    }

    String referencia(UUID pedidoId) {
        return pedidos.findById(pedidoId).orElseThrow().getReferenciaPago();
    }

    @Test
    void alCrearOtroPedidoSeCancelaLaSesionDePagoAnterior() {
        UUID intento = apoyo.intentoAprobado();
        UUID a = pedidoService.crear(intento, DATOS).pedidoId();
        pedidoService.crear(intento, DATOS);
        verify(proveedor).cancelarSesion(referencia(a));
    }

    @Test
    void siLaSesionAnteriorYaSePagoNoSeCreaOtroPedido() {
        UUID intento = apoyo.intentoAprobado();
        UUID a = pedidoService.crear(intento, DATOS).pedidoId();
        doThrow(new SesionYaPagadaException("cs")).when(proveedor).cancelarSesion(anyString());

        assertThatThrownBy(() -> pedidoService.crear(intento, DATOS)).isInstanceOf(ConflictoException.class);
        verify(proveedor, times(1)).crearSesion(any());
        assertThat(pedidos.findById(a).orElseThrow().getEstado()).isEqualTo(EstadoPedido.PENDIENTE_PAGO);
    }

    @Test
    void crearNoPisaUnPagoQueSeEstaConfirmandoALaVez() throws Exception {
        UUID intento = apoyo.intentoAprobado();
        UUID a = pedidoService.crear(intento, DATOS).pedidoId();
        String refA = referencia(a);
        CountDownLatch pagoBloqueado = new CountDownLatch(1);

        CompletableFuture<Void> webhook = CompletableFuture.runAsync(() -> tx.executeWithoutResult(s -> {
            pedidoService.marcarPagado(refA);
            pagoBloqueado.countDown();
            dormir(400);
        }));
        assertThat(pagoBloqueado.await(5, TimeUnit.SECONDS)).isTrue();

        assertThatThrownBy(() -> pedidoService.crear(intento, DATOS)).isInstanceOf(ConflictoException.class);
        webhook.get(5, TimeUnit.SECONDS);
        assertThat(pedidos.findById(a).orElseThrow().getEstado()).isIn(EstadoPedido.PAGADO, EstadoPedido.EMITIDO);
    }

    @Test
    void pedidoPagadoSinDiplomaSeEmiteAlRecibirOtraConfirmacion() {
        UUID a = pedidoService.crear(apoyo.intentoAprobado(), DATOS).pedidoId();
        // Simula que la emision fallo tras confirmar el pago: queda PAGADO sin diploma.
        tx.executeWithoutResult(s -> pedidos.findById(a).orElseThrow().marcarPagado());
        assertThat(diplomas.findByPedidoId(a)).isEmpty();

        pedidoService.marcarPagado(referencia(a));

        assertThat(diplomas.findByPedidoId(a)).isPresent();
        assertThat(pedidos.findById(a).orElseThrow().getEstado()).isEqualTo(EstadoPedido.EMITIDO);
    }

    static void dormir(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
