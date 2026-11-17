package es.cursos.plataforma.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DatosPreguntaDto(
        @NotBlank @Size(max = 1000) String enunciado,
        @NotNull @Size(min = 2, max = 6) List<@NotBlank @Size(max = 500) String> opciones,
        @NotNull Integer correcta) {
}
