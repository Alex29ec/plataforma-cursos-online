package es.cursos.plataforma.examen.dto;

import java.util.List;
import java.util.UUID;

public record IntentoCreadoDto(UUID intentoId, List<PreguntaExamenDto> preguntas) {
}
