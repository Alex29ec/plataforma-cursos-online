package es.cursos.plataforma;

import es.cursos.plataforma.curso.PreguntaRepository;
import es.cursos.plataforma.examen.ExamenService;
import es.cursos.plataforma.examen.dto.IntentoCreadoDto;
import es.cursos.plataforma.examen.dto.PreguntaExamenDto;
import org.springframework.boot.test.context.TestComponent;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/** Ayudas para preparar intentos de examen en los tests. Importar con @Import(ApoyoTests.class). */
@TestComponent
public class ApoyoTests {

    public static final String SLUG = "manipulador-alimentos";

    private final ExamenService examen;
    private final PreguntaRepository preguntas;

    public ApoyoTests(ExamenService examen, PreguntaRepository preguntas) {
        this.examen = examen;
        this.preguntas = preguntas;
    }

    public UUID intentoNoEntregado() {
        return examen.crearIntento(SLUG).intentoId();
    }

    public UUID intentoAprobado() {
        return entregado(true);
    }

    public UUID intentoSuspendido() {
        return entregado(false);
    }

    private UUID entregado(boolean bien) {
        IntentoCreadoDto intento = examen.crearIntento(SLUG);
        Map<Long, Integer> r = new HashMap<>();
        for (PreguntaExamenDto p : intento.preguntas()) {
            int correcta = preguntas.findById(p.id()).orElseThrow().getCorrecta();
            r.put(p.id(), bien ? correcta : (correcta + 1) % 4);
        }
        examen.entregar(intento.intentoId(), r);
        return intento.intentoId();
    }

    public static String datosAlumno(String dni, boolean acepta) {
        return """
                {"nombre":"Ana","apellidos":"García López","dni":"%s","email":"ana@example.com","aceptaPrivacidad":%s}
                """.formatted(dni, acepta);
    }
}
