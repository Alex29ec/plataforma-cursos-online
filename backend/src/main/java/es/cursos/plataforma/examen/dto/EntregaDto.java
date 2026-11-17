package es.cursos.plataforma.examen.dto;

import java.util.Map;

/** Respuestas del alumno: id de pregunta -> indice de la opcion elegida. */
public record EntregaDto(Map<Long, Integer> respuestas) {
}
