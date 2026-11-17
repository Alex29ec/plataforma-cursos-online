package es.cursos.plataforma.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import java.time.Clock;

/**
 * Solo {@code /api/admin/**} está protegido (sesión de administrador + CSRF). El resto de la API sigue
 * pública, sin sesión y sin CSRF (incluido el webhook de Stripe).
 */
@Configuration
public class SeguridadConfig {

    private static final Logger log = LoggerFactory.getLogger(SeguridadConfig.class);

    @Bean
    Clock reloj() {
        return Clock.systemUTC();
    }

    @Bean
    SecurityFilterChain seguridad(HttpSecurity http, Environment env) throws Exception {
        RequestMatcher admin = PathPatternRequestMatcher.withDefaults().matcher("/api/admin/**");
        http
                .securityMatcher("/**")
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.GET, "/api/admin/csrf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admin/login").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().permitAll())
                // Angular lee la cookie XSRF-TOKEN y la devuelve en la cabecera X-XSRF-TOKEN.
                .csrf(c -> c
                        .csrfTokenRepository(repositorioCsrf(env))
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                        .ignoringRequestMatchers(request -> !admin.matches(request)))
                .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                // Sin guardar la petición en sesión al dar 401: la API pública no debe crear sesiones.
                .requestCache(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(l -> l
                        .logoutRequestMatcher(PathPatternRequestMatcher.withDefaults()
                                .matcher(HttpMethod.POST, "/api/admin/logout"))
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT))
                        .deleteCookies("JSESSIONID"));
        return http.build();
    }

    /** Angular lee la cookie XSRF-TOKEN, así que no puede ser HttpOnly; en prod (solo HTTPS) es Secure. */
    static CookieCsrfTokenRepository repositorioCsrf(Environment env) {
        CookieCsrfTokenRepository repo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        if (env.matchesProfiles("prod")) {
            repo.setCookieCustomizer(c -> c.secure(true));
        }
        return repo;
    }

    /** Un único administrador; su contraseña se guarda solo como hash BCrypt calculado al arrancar. */
    @Bean
    AuthenticationManager gestorAutenticacion(AdminProperties props, Environment env) {
        props.validar(env);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        InMemoryUserDetailsManager usuarios = new InMemoryUserDetailsManager();
        if (props.configurado()) {
            usuarios.createUser(User.withUsername(props.usuario())
                    .password(encoder.encode(props.password()))
                    .roles("ADMIN")
                    .build());
        } else {
            log.warn("Sin ADMIN_USUARIO/ADMIN_PASSWORD: el acceso de administrador está desactivado");
        }
        DaoAuthenticationProvider proveedor = new DaoAuthenticationProvider(usuarios);
        proveedor.setPasswordEncoder(encoder);
        return new ProviderManager(proveedor);
    }
}
