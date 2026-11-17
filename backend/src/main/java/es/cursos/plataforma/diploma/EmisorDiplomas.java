package es.cursos.plataforma.diploma;

import es.cursos.plataforma.pedido.Pedido;

/**
 * Emite el diploma de un pedido PAGADO. Se elige con app.diplomas.emisor:
 * "automatico" genera el diploma al momento; "manual" lo deja en PAGADO para que lo emita una persona.
 */
public interface EmisorDiplomas {
    void emitir(Pedido pedido);
}
