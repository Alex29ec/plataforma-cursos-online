package es.cursos.plataforma.admin.dto;

import es.cursos.plataforma.curso.Curso;
import es.cursos.plataforma.curso.EstadoCurso;

public record CursoAdminDto(Long id, String slug, String titulo, String resumen, String descripcion, int horas,
                            int precioCentimos, int notaMinima, int numPreguntas, int orden, EstadoCurso estado,
                            String imagenUrl) {

    public static CursoAdminDto de(Curso c) {
        return new CursoAdminDto(c.getId(), c.getSlug(), c.getTitulo(), c.getResumen(), c.getDescripcion(),
                c.getHoras(), c.getPrecioCentimos(), c.getNotaMinima(), c.getNumPreguntas(), c.getOrden(),
                c.getEstado(), c.getImagenUrl());
    }
}
