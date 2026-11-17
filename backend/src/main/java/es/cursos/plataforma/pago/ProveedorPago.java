package es.cursos.plataforma.pago;

import es.cursos.plataforma.pedido.Pedido;

/** Crea la sesion de pago de un pedido. La confirmacion llega aparte (webhook o simulador). */
public interface ProveedorPago {

    SesionPago crearSesion(Pedido pedido);

    /**
     * Invalida una sesion de pago que ya no se va a usar, para que el alumno no pueda pagar dos veces.
     *
     * @throws SesionYaPagadaException si el cliente ya completo el pago de esa sesion
     */
    void cancelarSesion(String referencia);
}
