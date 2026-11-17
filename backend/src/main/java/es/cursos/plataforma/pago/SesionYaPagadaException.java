package es.cursos.plataforma.pago;

/** La sesion de pago no se puede cancelar porque el cliente ya ha pagado. */
public class SesionYaPagadaException extends RuntimeException {
    public SesionYaPagadaException(String referencia) {
        super("La sesión de pago " + referencia + " ya está pagada");
    }
}
