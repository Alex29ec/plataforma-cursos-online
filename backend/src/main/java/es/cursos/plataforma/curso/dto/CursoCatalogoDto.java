package es.cursos.plataforma.curso.dto;

import es.cursos.plataforma.curso.EstadoCurso;

public record CursoCatalogoDto(String slug, String titulo, String resumen, int horas, int precioCentimos,
                               EstadoCurso estado, String imagenUrl) {
}
