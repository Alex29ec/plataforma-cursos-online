package es.cursos.plataforma.admin.dto;

import es.cursos.plataforma.curso.EstadoCurso;
import jakarta.validation.constraints.NotNull;

public record CambioEstadoDto(@NotNull EstadoCurso estado) {
}
