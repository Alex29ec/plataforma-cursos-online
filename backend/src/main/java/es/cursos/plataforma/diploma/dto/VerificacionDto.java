package es.cursos.plataforma.diploma.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Datos publicos de un diploma. Nunca incluye el DNI completo ni el email. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record VerificacionDto(boolean valido, String codigo, String titular, String dniEnmascarado,
                              String curso, Integer horas, String fechaEmision) {

    public static VerificacionDto noValido() {
        return new VerificacionDto(false, null, null, null, null, null, null);
    }
}
