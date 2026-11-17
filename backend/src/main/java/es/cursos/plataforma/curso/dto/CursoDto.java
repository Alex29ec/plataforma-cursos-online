package es.cursos.plataforma.curso.dto;

import java.util.List;

public record CursoDto(String slug, String titulo, String descripcion, String resumen, String imagenUrl,
                       int horas, int precioCentimos, int notaMinima, int numPreguntas,
                       List<TemaResumenDto> temas) {
}
