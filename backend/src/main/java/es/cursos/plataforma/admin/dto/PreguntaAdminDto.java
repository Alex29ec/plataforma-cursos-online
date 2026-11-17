package es.cursos.plataforma.admin.dto;

import es.cursos.plataforma.curso.Pregunta;

import java.util.List;

public record PreguntaAdminDto(Long id, String enunciado, List<String> opciones, int correcta, boolean activa) {
    public static PreguntaAdminDto de(Pregunta p) {
        return new PreguntaAdminDto(p.getId(), p.getEnunciado(), List.copyOf(p.getOpciones()), p.getCorrecta(),
                p.isActiva());
    }
}
