package es.cursos.plataforma.admin;

import es.cursos.plataforma.comun.ConflictoException;
import es.cursos.plataforma.curso.Curso;
import es.cursos.plataforma.curso.CursoRepository;
import es.cursos.plataforma.curso.PreguntaRepository;
import es.cursos.plataforma.curso.TemaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminCursosServiceTest {

    @Test
    void violacionDeUnicidadAlCrearDa409() {
        CursoRepository cursos = mock(CursoRepository.class);
        when(cursos.existsBySlug(any())).thenReturn(false);
        when(cursos.saveAndFlush(any(Curso.class))).thenThrow(new DataIntegrityViolationException("uk_curso_slug"));
        var servicio = new AdminCursosService(cursos, mock(TemaRepository.class), mock(PreguntaRepository.class),
                mock(es.cursos.plataforma.imagen.AlmacenImagenes.class));
        assertThatThrownBy(() -> servicio.crear("Titulo"))
                .isInstanceOf(ConflictoException.class)
                .hasMessage("Ya existe un curso con esa dirección");
    }
}
