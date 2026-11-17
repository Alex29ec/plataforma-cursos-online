package es.cursos.plataforma.admin.dto;

import es.cursos.plataforma.curso.Tema;

public record TemaAdminDto(Long id, int orden, String titulo, String contenido) {
    public static TemaAdminDto de(Tema t) {
        return new TemaAdminDto(t.getId(), t.getOrden(), t.getTitulo(), t.getContenido());
    }
}
