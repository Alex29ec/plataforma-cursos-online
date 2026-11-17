package es.cursos.plataforma.curso;

import es.cursos.plataforma.comun.NoEncontradoException;
import es.cursos.plataforma.curso.dto.CursoCatalogoDto;
import es.cursos.plataforma.curso.dto.CursoDto;
import es.cursos.plataforma.curso.dto.TemaDto;
import es.cursos.plataforma.curso.dto.TemaResumenDto;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/cursos")
@Transactional(readOnly = true)
public class CursoController {

    private final CursoRepository cursos;
    private final TemaRepository temas;

    public CursoController(CursoRepository cursos, TemaRepository temas) {
        this.cursos = cursos;
        this.temas = temas;
    }

    @GetMapping
    public List<CursoCatalogoDto> catalogo() {
        return cursos.findByEstadoInOrderByOrdenAscTituloAsc(Set.of(EstadoCurso.PUBLICADO, EstadoCurso.PROXIMAMENTE))
                .stream()
                .map(c -> new CursoCatalogoDto(c.getSlug(), c.getTitulo(), c.getResumen(), c.getHoras(),
                        c.getPrecioCentimos(), c.getEstado(), c.getImagenUrl()))
                .toList();
    }

    @GetMapping("/{slug}")
    public CursoDto curso(@PathVariable String slug) {
        Curso c = buscar(slug);
        var resumen = temas.findByCursoOrderByOrdenAsc(c).stream()
                .map(t -> new TemaResumenDto(t.getOrden(), t.getTitulo()))
                .toList();
        return new CursoDto(c.getSlug(), c.getTitulo(), c.getDescripcion(), c.getResumen(), c.getImagenUrl(), c.getHoras(), c.getPrecioCentimos(),
                c.getNotaMinima(), c.getNumPreguntas(), resumen);
    }

    @GetMapping("/{slug}/temas/{orden}")
    public TemaDto tema(@PathVariable String slug, @PathVariable int orden) {
        Tema t = temas.findByCursoAndOrden(buscar(slug), orden)
                .orElseThrow(() -> new NoEncontradoException("Tema no encontrado"));
        return new TemaDto(t.getOrden(), t.getTitulo(), t.getContenido());
    }

    private Curso buscar(String slug) {
        return cursos.findBySlugAndEstado(slug, EstadoCurso.PUBLICADO)
                .orElseThrow(() -> new NoEncontradoException("Curso no encontrado"));
    }
}
