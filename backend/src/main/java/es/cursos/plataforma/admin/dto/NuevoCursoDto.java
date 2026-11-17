package es.cursos.plataforma.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NuevoCursoDto(@NotBlank @Size(max = 200) String titulo) {
}
