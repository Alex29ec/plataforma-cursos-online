package es.cursos.plataforma.curso;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PreguntaRepository extends JpaRepository<Pregunta, Long> {
    List<Pregunta> findByCurso(Curso curso);

    List<Pregunta> findByCursoOrderByActivaDescIdAsc(Curso curso);

    List<Pregunta> findByCursoAndActivaTrue(Curso curso);

    long countByCursoAndActivaTrue(Curso curso);
}
