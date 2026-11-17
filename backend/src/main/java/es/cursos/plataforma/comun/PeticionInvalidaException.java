package es.cursos.plataforma.comun;

/** Peticion bien formada pero con datos incoherentes (se responde 400). */
public class PeticionInvalidaException extends RuntimeException {
    public PeticionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
