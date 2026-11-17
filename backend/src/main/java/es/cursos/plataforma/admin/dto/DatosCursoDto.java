package es.cursos.plataforma.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DatosCursoDto(
        @NotBlank @Size(max = 100) @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Solo minúsculas, números y guiones") String slug,
        @NotBlank @Size(max = 200) String titulo,
        @Size(max = 200) String resumen,
        @NotNull @Size(max = 4000) String descripcion,
        @NotNull @Min(1) @Max(1000) Integer horas,
        @NotNull @Min(0) @Max(100000) Integer precioCentimos,
        @NotNull @Min(1) @Max(100) Integer notaMinima,
        @NotNull @Min(1) @Max(200) Integer numPreguntas,
        @NotNull @Min(0) @Max(9999) Integer orden) {
}
