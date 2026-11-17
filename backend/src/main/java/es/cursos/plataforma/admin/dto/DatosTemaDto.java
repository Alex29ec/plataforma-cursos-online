package es.cursos.plataforma.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DatosTemaDto(
        @NotBlank @Size(max = 200) String titulo,
        @NotBlank @Size(max = 20000) String contenido) {
}
