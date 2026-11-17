package es.cursos.plataforma.examen;

import es.cursos.plataforma.comun.ConflictoException;
import es.cursos.plataforma.comun.NoEncontradoException;
import es.cursos.plataforma.curso.Curso;
import es.cursos.plataforma.curso.CursoRepository;
import es.cursos.plataforma.curso.EstadoCurso;
import es.cursos.plataforma.curso.dto.CursoResumenDto;
import es.cursos.plataforma.curso.Pregunta;
import es.cursos.plataforma.curso.PreguntaRepository;
import es.cursos.plataforma.examen.dto.IntentoCreadoDto;
import es.cursos.plataforma.examen.dto.PreguntaExamenDto;
import es.cursos.plataforma.examen.dto.ResultadoDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ExamenService {

    private final CursoRepository cursos;
    private final PreguntaRepository preguntas;
    private final IntentoRepository intentos;

    public ExamenService(CursoRepository cursos, PreguntaRepository preguntas, IntentoRepository intentos) {
        this.cursos = cursos;
        this.preguntas = preguntas;
        this.intentos = intentos;
    }

    @Transactional
    public IntentoCreadoDto crearIntento(String slug) {
        Curso curso = cursos.findBySlugAndEstado(slug, EstadoCurso.PUBLICADO)
                .orElseThrow(() -> new NoEncontradoException("Curso no encontrado"));
        List<Pregunta> banco = new ArrayList<>(preguntas.findByCursoAndActivaTrue(curso));
        Collections.shuffle(banco);
        List<Pregunta> elegidas = banco.subList(0, Math.min(curso.getNumPreguntas(), banco.size()));

        IntentoExamen intento = intentos.save(
                new IntentoExamen(curso, elegidas.stream().map(Pregunta::getId).toList()));
        List<PreguntaExamenDto> dto = elegidas.stream()
                .map(p -> new PreguntaExamenDto(p.getId(), p.getEnunciado(), List.copyOf(p.getOpciones())))
                .toList();
        return new IntentoCreadoDto(intento.getId(), dto);
    }

    @Transactional
    public ResultadoDto entregar(UUID intentoId, Map<Long, Integer> respuestas) {
        IntentoExamen intento = intentos.findParaActualizar(intentoId)
                .orElseThrow(() -> new NoEncontradoException("Intento no encontrado"));
        if (intento.isEntregado()) {
            throw new ConflictoException("Este examen ya se ha entregado");
        }
        Map<Long, Integer> enviadas = respuestas == null ? Map.of() : respuestas;
        Set<Long> delIntento = new HashSet<>(intento.getPreguntaIds());
        Map<Long, Integer> validas = enviadas.entrySet().stream()
                .filter(e -> e.getKey() != null && e.getValue() != null && delIntento.contains(e.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        Map<Long, Pregunta> porId = preguntas.findAllById(intento.getPreguntaIds()).stream()
                .collect(Collectors.toMap(Pregunta::getId, Function.identity()));
        int aciertos = (int) intento.getPreguntaIds().stream()
                .filter(id -> Objects.equals(validas.get(id), porId.get(id).getCorrecta()))
                .count();
        int total = intento.getPreguntaIds().size();
        int nota = total == 0 ? 0 : Math.round(aciertos * 100f / total);
        boolean aprobado = nota >= intento.getCurso().getNotaMinima();

        intento.registrarEntrega(validas, nota, aprobado);
        return new ResultadoDto(nota, aprobado, intento.getCurso().getNotaMinima(), aciertos, total);
    }

    @Transactional(readOnly = true)
    public ResultadoDto resultado(UUID intentoId) {
        IntentoExamen intento = buscar(intentoId);
        if (!intento.isEntregado()) {
            throw new ConflictoException("El examen aún no se ha entregado");
        }
        Map<Long, Pregunta> porId = preguntas.findAllById(intento.getPreguntaIds()).stream()
                .collect(Collectors.toMap(Pregunta::getId, Function.identity()));
        int aciertos = (int) intento.getPreguntaIds().stream()
                .filter(id -> Objects.equals(intento.getRespuestas().get(id), porId.get(id).getCorrecta()))
                .count();
        return new ResultadoDto(intento.getNota(), intento.isAprobado(), intento.getCurso().getNotaMinima(),
                aciertos, intento.getPreguntaIds().size());
    }

    @Transactional(readOnly = true)
    public CursoResumenDto cursoDeIntento(UUID intentoId) {
        Curso c = buscar(intentoId).getCurso();
        return new CursoResumenDto(c.getSlug(), c.getTitulo(), c.getPrecioCentimos());
    }

    /** Devuelve el intento si esta entregado y aprobado; si no, lanza excepcion. */
    @Transactional(readOnly = true)
    public IntentoExamen intentoAprobado(UUID intentoId) {
        IntentoExamen intento = buscar(intentoId);
        if (!intento.isEntregado() || !intento.isAprobado()) {
            throw new ConflictoException("El examen no está aprobado");
        }
        return intento;
    }

    private IntentoExamen buscar(UUID id) {
        return intentos.findById(id).orElseThrow(() -> new NoEncontradoException("Intento no encontrado"));
    }
}
