package es.cursos.plataforma.examen.dto;

import java.util.List;

/** Pregunta tal como la ve el alumno: sin la respuesta correcta. */
public record PreguntaExamenDto(Long id, String enunciado, List<String> opciones) {
}
