package es.cursos.plataforma.diploma;

import es.cursos.plataforma.pedido.Pedido;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Deja el pedido en PAGADO: el diploma lo emitira una persona (pantalla pendiente para una version futura). */
@Component
@ConditionalOnProperty(name = "app.diplomas.emisor", havingValue = "manual")
public class EmisorManual implements EmisorDiplomas {

    private static final Logger log = LoggerFactory.getLogger(EmisorManual.class);

    @Override
    public void emitir(Pedido pedido) {
        log.info("Pedido {} pagado: pendiente de emisión manual del diploma", pedido.getId());
    }
}
