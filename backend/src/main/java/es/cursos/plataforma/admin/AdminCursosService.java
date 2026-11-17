package es.cursos.plataforma.admin;

import es.cursos.plataforma.admin.dto.CursoAdminDto;
import es.cursos.plataforma.admin.dto.CursoAdminResumenDto;
import es.cursos.plataforma.admin.dto.DatosCursoDto;
import es.cursos.plataforma.comun.ConflictoException;
import es.cursos.plataforma.comun.NoEncontradoException;
import es.cursos.plataforma.curso.Curso;
import es.cursos.plataforma.curso.CursoRepository;
import es.cursos.plataforma.curso.EstadoCurso;
import es.cursos.plataforma.curso.PreguntaRepository;
import es.cursos.plataforma.curso.TemaRepository;
import org.springframework.dao.DataIntegrityViolationException;
import es.cursos.plataforma.comun.PeticionInvalidaException;
import es.cursos.plataforma.imagen.AlmacenImagenes;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminCursosService {

    private static final String MSG_SLUG = "Ya existe un curso con esa dirección";

    private final CursoRepository cursos;
    private final TemaRepository temas;
    private final PreguntaRepository preguntas;
    private final AlmacenImagenes imagenes;

    public AdminCursosService(CursoRepository cursos, TemaRepository temas, PreguntaRepository preguntas,
                              AlmacenImagenes imagenes) {
        this.imagenes = imagenes;
        this.cursos = cursos;
        this.temas = temas;
        this.preguntas = preguntas;
    }

    @Transactional(readOnly = true)
    public List<CursoAdminResumenDto> listar() {
        return cursos.findAllByOrderByOrdenAscTituloAsc().stream()
                .map(c -> new CursoAdminResumenDto(c.getId(), c.getSlug(), c.getTitulo(), c.getEstado(),
                        temas.countByCurso(c), preguntas.countByCursoAndActivaTrue(c), c.getPrecioCentimos(),
                        c.getImagenUrl()))
                .toList();
    }

    @Transactional(readOnly = true)
    public CursoAdminDto obtener(Long id) {
        return CursoAdminDto.de(buscar(id));
    }

    public CursoAdminDto crear(String titulo) {
        String base = Slugs.desde(titulo);
        String slug = base;
        for (int n = 2; cursos.existsBySlug(slug); n++) {
            slug = Slugs.conSufijo(base, n);
        }
        try {
            return CursoAdminDto.de(cursos.saveAndFlush(Curso.nuevo(titulo.trim(), slug)));
        } catch (DataIntegrityViolationException e) {
            throw new ConflictoException(MSG_SLUG);
        }
    }

    public CursoAdminDto actualizar(Long id, DatosCursoDto d) {
        Curso c = buscar(id);
        if (!d.slug().equals(c.getSlug())) {
            if (c.getEstado() != EstadoCurso.BORRADOR) {
                throw new ConflictoException("El slug solo se puede cambiar en un curso en borrador");
            }
            if (cursos.existsBySlugAndIdNot(d.slug(), c.getId())) {
                throw new ConflictoException(MSG_SLUG);
            }
            c.setSlug(d.slug());
        }
        c.setTitulo(d.titulo().trim());
        c.setResumen(d.resumen() == null || d.resumen().isBlank() ? null : d.resumen());
        c.setDescripcion(d.descripcion());
        c.setHoras(d.horas());
        c.setPrecioCentimos(d.precioCentimos());
        c.setNotaMinima(d.notaMinima());
        c.setNumPreguntas(d.numPreguntas());
        c.setOrden(d.orden());
        try {
            cursos.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ConflictoException(MSG_SLUG);
        }
        if (c.getEstado() == EstadoCurso.PUBLICADO) {
            verificarPublicable(c);
        }
        return CursoAdminDto.de(c);
    }

    public CursoAdminDto cambiarEstado(Long id, EstadoCurso estado) {
        Curso c = buscar(id);
        if (estado == EstadoCurso.PUBLICADO) {
            verificarPublicable(c);
        }
        c.setEstado(estado);
        return CursoAdminDto.de(c);
    }

    /** Sustituye la imagen del curso; el fichero anterior se borra solo cuando la transacción se confirma. */
    public CursoAdminDto ponerImagen(Long id, byte[] datos) {
        Curso c = buscar(id);
        String nueva;
        try {
            nueva = imagenes.guardar(datos);
        } catch (IllegalArgumentException e) {
            throw new PeticionInvalidaException(e.getMessage());
        }
        String anterior = c.getImagen();
        c.setImagen(nueva);
        alTerminar(anterior, nueva);
        return CursoAdminDto.de(c);
    }

    public CursoAdminDto quitarImagen(Long id) {
        Curso c = buscar(id);
        String anterior = c.getImagen();
        c.setImagen(null);
        alTerminar(anterior, null);
        return CursoAdminDto.de(c);
    }

    /** Tras confirmar borra {@code siOk}; si la transacción se revierte, borra {@code siFalla}. */
    private void alTerminar(String siOk, String siFalla) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int estado) {
                String f = estado == STATUS_COMMITTED ? siOk : siFalla;
                if (f != null) {
                    imagenes.borrar(f);
                }
            }
        });
    }

    private void verificarPublicable(Curso c) {
        ReglasPublicacion.verificar(c, temas.countByCurso(c), preguntas.countByCursoAndActivaTrue(c));
    }

    private Curso buscar(Long id) {
        return cursos.findById(id).orElseThrow(() -> new NoEncontradoException("Curso no encontrado"));
    }
}
