package es.cursos.plataforma.admin.dto;

/** Credenciales del formulario de acceso. Sin toString propio que muestre la contraseña. */
public record LoginDto(String usuario, String password) {

    @Override
    public String toString() {
        return "LoginDto[usuario=" + usuario + ", password=****]";
    }
}
