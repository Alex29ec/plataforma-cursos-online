package es.cursos.plataforma.admin;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.env.Environment;

import java.nio.charset.StandardCharsets;

/**
 * Credenciales del único administrador. Vienen de ADMIN_USUARIO y ADMIN_PASSWORD; nunca en el repositorio.
 * Ni el usuario ni la contraseña se escriben en los logs ni en los mensajes de error.
 */
@ConfigurationProperties("app.admin")
public record AdminProperties(String usuario, String password) {

    /** ¿Hay credenciales configuradas? Sin ellas el acceso de administrador queda desactivado. */
    public boolean configurado() {
        return !vacio(usuario) && !vacio(password);
    }

    /**
     * BCrypt solo admite 72 bytes (en cualquier perfil). Con el perfil prod además no se arranca sin
     * credenciales o con la contraseña por defecto.
     */
    public void validar(Environment env) {
        if (password != null && password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("La contraseña del panel no puede superar 72 bytes");
        }
        if (!env.matchesProfiles("prod")) {
            return;
        }
        if (vacio(usuario)) {
            throw new IllegalStateException("Falta la variable de entorno ADMIN_USUARIO (obligatoria con el perfil prod)");
        }
        if (vacio(password)) {
            throw new IllegalStateException("Falta la variable de entorno ADMIN_PASSWORD (obligatoria con el perfil prod)");
        }
        if ("admin".equals(password)) {
            throw new IllegalStateException("ADMIN_PASSWORD no puede ser la contraseña por defecto con el perfil prod");
        }
    }

    private static boolean vacio(String valor) {
        return valor == null || valor.isBlank();
    }
}
