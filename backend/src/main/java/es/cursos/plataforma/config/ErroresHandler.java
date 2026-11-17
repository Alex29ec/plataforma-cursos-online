package es.cursos.plataforma.config;

import es.cursos.plataforma.comun.ConflictoException;
import es.cursos.plataforma.comun.NoEncontradoException;
import es.cursos.plataforma.comun.PeticionInvalidaException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ErroresHandler {

    public record Error(String error, Map<String, String> campos) {
    }

    @ExceptionHandler(NoEncontradoException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Error noEncontrado(NoEncontradoException e) {
        return new Error(e.getMessage(), Map.of());
    }

    /** Un id con formato incorrecto (p. ej. UUID mal formado) se trata como inexistente. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Error tipoInvalido(MethodArgumentTypeMismatchException e) {
        return new Error("No encontrado", Map.of());
    }

    @ExceptionHandler(ConflictoException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Error conflicto(ConflictoException e) {
        return new Error(e.getMessage(), Map.of());
    }

    @ExceptionHandler(PeticionInvalidaException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Error peticionInvalida(PeticionInvalidaException e) {
        return new Error(e.getMessage(), Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Error validacion(MethodArgumentNotValidException e) {
        Map<String, String> campos = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(f -> campos.putIfAbsent(f.getField(), f.getDefaultMessage()));
        return new Error("Datos no válidos", campos);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Error subidaDemasiadoGrande(MaxUploadSizeExceededException e) {
        return new Error("La imagen supera 5 MB", Map.of());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Error ilegible(HttpMessageNotReadableException e) {
        return new Error("Petición no válida", Map.of());
    }
}
