package es.cursos.plataforma.comun;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.RECORD_COMPONENT, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DniNieValido.Validador.class)
public @interface DniNieValido {

    String message() default "El DNI/NIE no es válido";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class Validador implements ConstraintValidator<DniNieValido, String> {
        @Override
        public boolean isValid(String value, ConstraintValidatorContext context) {
            return DniNie.esValido(value);
        }
    }
}
