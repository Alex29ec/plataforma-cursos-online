package es.cursos.plataforma.admin.dto;

import es.cursos.plataforma.curso.EstadoCurso;

public record CursoAdminResumenDto(Long id, String slug, String titulo, EstadoCurso estado, int temas,
                                   long preguntasActivas, int precioCentimos, String imagenUrl) {
}
