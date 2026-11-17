package es.cursos.plataforma.examen;

import es.cursos.plataforma.comun.ConflictoException;
import es.cursos.plataforma.curso.PreguntaRepository;
import es.cursos.plataforma.examen.dto.IntentoCreadoDto;
import es.cursos.plataforma.examen.dto.PreguntaExamenDto;
import es.cursos.plataforma.examen.dto.ResultadoDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ExamenServiceTest {

    static final String SLUG = "manipulador-alimentos";

    @Autowired
    ExamenService examen;
    @Autowired
    PreguntaRepository preguntas;

    /** Responde bien las primeras {@code aciertos} preguntas y mal el resto. */
    Map<Long, Integer> respuestas(IntentoCreadoDto intento, int aciertos) {
        Map<Long, Integer> r = new HashMap<>();
        int i = 0;
        for (PreguntaExamenDto p : intento.preguntas()) {
            int correcta = preguntas.findById(p.id()).orElseThrow().getCorrecta();
            r.put(p.id(), i++ < aciertos ? correcta : (correcta + 1) % 4);
        }
        return r;
    }

    @Test
    void intentoTieneNumPreguntasDistintasDelCurso() {
        IntentoCreadoDto intento = examen.crearIntento(SLUG);
        assertThat(intento.preguntas()).hasSize(20);
        assertThat(new HashSet<>(intento.preguntas().stream().map(PreguntaExamenDto::id).toList())).hasSize(20);
        assertThat(intento.preguntas().getFirst().opciones()).hasSize(4);
    }

    @Test
    void todasCorrectasDaNota100YAprueba() {
        IntentoCreadoDto intento = examen.crearIntento(SLUG);
        ResultadoDto r = examen.entregar(intento.intentoId(), respuestas(intento, 20));
        assertThat(r.nota()).isEqualTo(100);
        assertThat(r.aprobado()).isTrue();
        assertThat(r.aciertos()).isEqualTo(20);
        assertThat(r.total()).isEqualTo(20);
        assertThat(r.notaMinima()).isEqualTo(75);
    }

    @Test
    void quinceDeVeinteApruebaYCatorceSuspende() {
        IntentoCreadoDto a = examen.crearIntento(SLUG);
        ResultadoDto ra = examen.entregar(a.intentoId(), respuestas(a, 15));
        assertThat(ra.nota()).isEqualTo(75);
        assertThat(ra.aprobado()).isTrue();

        IntentoCreadoDto b = examen.crearIntento(SLUG);
        ResultadoDto rb = examen.entregar(b.intentoId(), respuestas(b, 14));
        assertThat(rb.nota()).isEqualTo(70);
        assertThat(rb.aprobado()).isFalse();
    }

    @Test
    void respuestaAPreguntaAjenaAlIntentoSeIgnora() {
        IntentoCreadoDto intento = examen.crearIntento(SLUG);
        Map<Long, Integer> r = respuestas(intento, 0);
        r.put(-1L, 0);
        ResultadoDto res = examen.entregar(intento.intentoId(), r);
        assertThat(res.aciertos()).isZero();
        assertThat(res.total()).isEqualTo(20);
    }

    @Test
    void preguntaSinResponderCuentaComoFallo() {
        IntentoCreadoDto intento = examen.crearIntento(SLUG);
        Map<Long, Integer> r = respuestas(intento, 20);
        r.remove(intento.preguntas().getFirst().id());
        ResultadoDto res = examen.entregar(intento.intentoId(), r);
        assertThat(res.aciertos()).isEqualTo(19);
        assertThat(res.nota()).isEqualTo(95);
    }

    @Test
    void segundaEntregaLanzaConflicto() {
        IntentoCreadoDto intento = examen.crearIntento(SLUG);
        examen.entregar(intento.intentoId(), respuestas(intento, 0));
        assertThatThrownBy(() -> examen.entregar(intento.intentoId(), respuestas(intento, 20)))
                .isInstanceOf(ConflictoException.class);
        assertThat(examen.resultado(intento.intentoId()).nota()).isZero();
    }

    @Test
    void intentoAprobadoRechazaSuspendidoYNoEntregado() {
        IntentoCreadoDto noEntregado = examen.crearIntento(SLUG);
        assertThatThrownBy(() -> examen.intentoAprobado(noEntregado.intentoId()))
                .isInstanceOf(ConflictoException.class);

        IntentoCreadoDto suspendido = examen.crearIntento(SLUG);
        examen.entregar(suspendido.intentoId(), respuestas(suspendido, 0));
        assertThatThrownBy(() -> examen.intentoAprobado(suspendido.intentoId()))
                .isInstanceOf(ConflictoException.class);

        IntentoCreadoDto aprobado = examen.crearIntento(SLUG);
        examen.entregar(aprobado.intentoId(), respuestas(aprobado, 20));
        assertThat(examen.intentoAprobado(aprobado.intentoId()).isAprobado()).isTrue();
    }
}
