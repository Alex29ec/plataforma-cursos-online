package es.cursos.plataforma.pedido.dto;

import es.cursos.plataforma.comun.DniNieValido;
import jakarta.validation.constraints.*;

public record DatosAlumnoDto(
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 100) String nombre,
        @NotBlank(message = "Los apellidos son obligatorios") @Size(max = 150) String apellidos,
        @DniNieValido String dni,
        @NotBlank(message = "El email es obligatorio") @Email(message = "El email no es válido") @Size(max = 254) String email,
        @NotNull @AssertTrue(message = "Debes aceptar la política de privacidad") Boolean aceptaPrivacidad) {
}
