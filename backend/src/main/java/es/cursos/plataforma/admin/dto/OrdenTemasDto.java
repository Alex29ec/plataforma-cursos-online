package es.cursos.plataforma.admin.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record OrdenTemasDto(@NotNull List<Long> ids) {
}
