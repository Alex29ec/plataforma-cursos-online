package es.cursos.plataforma.curso;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TemaRepository extends JpaRepository<Tema, Long> {
    List<Tema> findByCursoOrderByOrdenAsc(Curso curso);

    Optional<Tema> findByCursoAndOrden(Curso curso, int orden);

    int countByCurso(Curso curso);

    @Query("select coalesce(max(t.orden), 0) from Tema t where t.curso = ?1")
    int findMaxOrden(Curso curso);
}
