package es.cursos.plataforma.admin;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

import static org.assertj.core.api.Assertions.assertThat;

class CsrfCookieSecureTest {

    private static Cookie cookieCon(MockEnvironment env) {
        CookieCsrfTokenRepository repo = SeguridadConfig.repositorioCsrf(env);
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();
        repo.saveToken(repo.generateToken(req), req, res);
        return res.getCookie("XSRF-TOKEN");
    }

    @Test
    void conPerfilProdLaCookieXsrfEsSecureYLegibleDesdeJs() {
        MockEnvironment prod = new MockEnvironment();
        prod.setActiveProfiles("prod");
        Cookie c = cookieCon(prod);
        assertThat(c.getSecure()).isTrue();
        assertThat(c.isHttpOnly()).isFalse();
    }

    @Test
    void enLocalLaCookieXsrfNoEsSecure() {
        Cookie c = cookieCon(new MockEnvironment());
        assertThat(c.getSecure()).isFalse();
        assertThat(c.isHttpOnly()).isFalse();
    }
}
