package es.cursos.plataforma.curso;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CursoRepository extends JpaRepository<Curso, Long> {
    Optional<Curso> findBySlugAndEstado(String slug, EstadoCurso estado);

    List<Curso> findByEstadoInOrderByOrdenAscTituloAsc(Collection<EstadoCurso> estados);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    List<Curso> findAllByOrderByOrdenAscTituloAsc();
}
