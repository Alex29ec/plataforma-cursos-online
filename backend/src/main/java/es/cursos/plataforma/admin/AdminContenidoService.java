package es.cursos.plataforma.admin;

import es.cursos.plataforma.admin.dto.DatosPreguntaDto;
import es.cursos.plataforma.admin.dto.DatosTemaDto;
import es.cursos.plataforma.admin.dto.PreguntaAdminDto;
import es.cursos.plataforma.admin.dto.TemaAdminDto;
import es.cursos.plataforma.comun.NoEncontradoException;
import es.cursos.plataforma.comun.PeticionInvalidaException;
import es.cursos.plataforma.curso.Curso;
import es.cursos.plataforma.curso.CursoRepository;
import es.cursos.plataforma.curso.EstadoCurso;
import es.cursos.plataforma.curso.Pregunta;
import es.cursos.plataforma.curso.PreguntaRepository;
import es.cursos.plataforma.curso.Tema;
import es.cursos.plataforma.curso.TemaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminContenidoService {

    private final CursoRepository cursos;
    private final TemaRepository temas;
    private final PreguntaRepository preguntas;

    public AdminContenidoService(CursoRepository cursos, TemaRepository temas, PreguntaRepository preguntas) {
        this.cursos = cursos;
        this.temas = temas;
        this.preguntas = preguntas;
    }

    // ---- temas ----

    @Transactional(readOnly = true)
    public List<TemaAdminDto> listarTemas(Long cursoId) {
        return temas.findByCursoOrderByOrdenAsc(curso(cursoId)).stream().map(TemaAdminDto::de).toList();
    }

    public TemaAdminDto crearTema(Long cursoId, DatosTemaDto d) {
        Curso c = curso(cursoId);
        Tema t = temas.saveAndFlush(new Tema(c, temas.findMaxOrden(c) + 1, d.titulo().trim(), d.contenido()));
        return TemaAdminDto.de(t);
    }

    public TemaAdminDto editarTema(Long cursoId, Long temaId, DatosTemaDto d) {
        Tema t = tema(curso(cursoId), temaId);
        t.setTitulo(d.titulo().trim());
        t.setContenido(d.contenido());
        return TemaAdminDto.de(t);
    }

    public void borrarTema(Long cursoId, Long temaId) {
        Curso c = curso(cursoId);
        Tema t = tema(c, temaId);
        if (c.getEstado() == EstadoCurso.PUBLICADO) {
            ReglasPublicacion.verificar(c, temas.countByCurso(c) - 1, preguntas.countByCursoAndActivaTrue(c));
        }
        temas.delete(t);
        temas.flush();
        renumerar(temas.findByCursoOrderByOrdenAsc(c));
    }

    public List<TemaAdminDto> reordenarTemas(Long cursoId, List<Long> ids) {
        Curso c = curso(cursoId);
        List<Tema> actuales = temas.findByCursoOrderByOrdenAsc(c);
        if (ids.size() != actuales.size() || !new HashSet<>(ids).equals(
                actuales.stream().map(Tema::getId).collect(Collectors.toSet()))) {
            throw new PeticionInvalidaException("La lista debe contener exactamente los temas del curso");
        }
        Map<Long, Tema> porId = actuales.stream().collect(Collectors.toMap(Tema::getId, Function.identity()));
        renumerar(ids.stream().map(porId::get).toList());
        return temas.findByCursoOrderByOrdenAsc(c).stream().map(TemaAdminDto::de).toList();
    }

    /** Asigna 1..n en el orden dado; pasa por ordenes negativos para no chocar con UNIQUE (curso_id, orden). */
    private void renumerar(List<Tema> enOrden) {
        for (int i = 0; i < enOrden.size(); i++) {
            enOrden.get(i).setOrden(-(i + 1));
        }
        temas.flush();
        for (int i = 0; i < enOrden.size(); i++) {
            enOrden.get(i).setOrden(i + 1);
        }
        temas.flush();
    }

    // ---- preguntas ----

    @Transactional(readOnly = true)
    public List<PreguntaAdminDto> listarPreguntas(Long cursoId) {
        return preguntas.findByCursoOrderByActivaDescIdAsc(curso(cursoId)).stream().map(PreguntaAdminDto::de).toList();
    }

    public PreguntaAdminDto crearPregunta(Long cursoId, DatosPreguntaDto d) {
        Curso c = curso(cursoId);
        validarCorrecta(d);
        return PreguntaAdminDto.de(preguntas.saveAndFlush(
                new Pregunta(c, d.enunciado().trim(), d.opciones(), d.correcta())));
    }

    public PreguntaAdminDto editarPregunta(Long cursoId, Long preguntaId, DatosPreguntaDto d) {
        Pregunta p = pregunta(curso(cursoId), preguntaId);
        validarCorrecta(d);
        p.setEnunciado(d.enunciado().trim());
        p.setOpciones(d.opciones());
        p.setCorrecta(d.correcta());
        return PreguntaAdminDto.de(p);
    }

    /** "Borrar" una pregunta la desactiva: los intentos antiguos siguen apuntando a ella. */
    public void desactivarPregunta(Long cursoId, Long preguntaId) {
        Curso c = curso(cursoId);
        Pregunta p = pregunta(c, preguntaId);
        if (!p.isActiva()) {
            return;
        }
        if (c.getEstado() == EstadoCurso.PUBLICADO) {
            ReglasPublicacion.verificar(c, temas.countByCurso(c), preguntas.countByCursoAndActivaTrue(c) - 1);
        }
        p.setActiva(false);
    }

    private void validarCorrecta(DatosPreguntaDto d) {
        if (d.correcta() < 0 || d.correcta() >= d.opciones().size()) {
            throw new PeticionInvalidaException("La respuesta correcta debe ser una de las opciones");
        }
    }

    // ---- busquedas (un elemento de otro curso es un 404) ----

    private Curso curso(Long id) {
        return cursos.findById(id).orElseThrow(() -> new NoEncontradoException("Curso no encontrado"));
    }

    private Tema tema(Curso c, Long id) {
        return temas.findById(id).filter(t -> t.getCurso().getId().equals(c.getId()))
                .orElseThrow(() -> new NoEncontradoException("Tema no encontrado"));
    }

    private Pregunta pregunta(Curso c, Long id) {
        return preguntas.findById(id).filter(p -> p.getCurso().getId().equals(c.getId()))
                .orElseThrow(() -> new NoEncontradoException("Pregunta no encontrada"));
    }
}
