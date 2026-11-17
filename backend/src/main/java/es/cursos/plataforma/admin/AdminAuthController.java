package es.cursos.plataforma.admin;

import es.cursos.plataforma.admin.dto.LoginDto;
import es.cursos.plataforma.config.ErroresHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Objects;

/** Acceso del administrador. El cierre de sesión (POST /logout) lo resuelve Spring Security. */
@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private final AuthenticationManager autenticacion;
    private final LimitadorIntentos limitador;
    private final SecurityContextRepository contextos = new HttpSessionSecurityContextRepository();
    private final SecurityContextHolderStrategy holder = SecurityContextHolder.getContextHolderStrategy();

    public AdminAuthController(AuthenticationManager autenticacion, LimitadorIntentos limitador) {
        this.autenticacion = autenticacion;
        this.limitador = limitador;
    }

    /** Fuerza a generar el token CSRF para que se escriba la cookie XSRF-TOKEN. */
    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(CsrfToken token) {
        token.getToken();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto dto, HttpServletRequest request, HttpServletResponse response) {
        String ip = request.getRemoteAddr();
        // Reserva atómica antes del BCrypt (lento): las peticiones simultáneas no superan el límite.
        if (!limitador.intentar(ip)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(new ErroresHandler.Error(
                    "Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentarlo.", Map.of()));
        }
        Authentication auth;
        try {
            auth = autenticacion.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
                    Objects.toString(dto.usuario(), ""), Objects.toString(dto.password(), "")));
        } catch (AuthenticationException e) {
            limitador.fallo(ip);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErroresHandler.Error("Usuario o contraseña incorrectos", Map.of()));
        } catch (RuntimeException e) {
            // Error inesperado: la reserva se resuelve como fallo para no dejarla colgada.
            limitador.fallo(ip);
            throw e;
        }
        limitador.exito(ip);
        // Nuevo id de sesión al entrar para evitar la fijación de sesión.
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        SecurityContext contexto = holder.createEmptyContext();
        contexto.setAuthentication(auth);
        holder.setContext(contexto);
        contextos.saveContext(contexto, request, response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/yo")
    public Map<String, String> yo(Authentication auth) {
        return Map.of("usuario", auth.getName());
    }
}
