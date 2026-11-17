package es.cursos.plataforma.admin;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminAuthTest {

    @Autowired
    MockMvc mvc;

    static RequestPostProcessor ip(String ip) {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }

    static String credenciales(String usuario, String password) {
        return "{\"usuario\":\"" + usuario + "\",\"password\":\"" + password + "\"}";
    }

    @Test
    void sinSesionLasRutasAdminDan401() throws Exception {
        mvc.perform(get("/api/admin/yo"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("Location"));
        mvc.perform(get("/api/admin/cursos"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("Location"));
    }

    @Test
    void loginCorrectoDaSesionYYoDevuelveUsuario() throws Exception {
        MockHttpSession s = AdminTestSoporte.login(mvc);
        assertThat(s).isNotNull();
        mvc.perform(get("/api/admin/yo").session(s))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario").value("admin"));
    }

    @Test
    void loginIncorrectoDa401() throws Exception {
        mvc.perform(post("/api/admin/login").with(csrf()).with(ip("10.0.0.1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credenciales("admin", "mala")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void loginSinCsrfDa403() throws Exception {
        mvc.perform(post("/api/admin/login").with(ip("10.0.0.2"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credenciales("admin", "secreto-test")))
                .andExpect(status().isForbidden());
    }

    @Test
    void seisFallosSeguidosDan429InclusoConPasswordCorrecta() throws Exception {
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/admin/login").with(csrf()).with(ip("10.0.0.3"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(credenciales("admin", "mala" + i)))
                    .andExpect(status().isUnauthorized());
        }
        mvc.perform(post("/api/admin/login").with(csrf()).with(ip("10.0.0.3"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credenciales("admin", "secreto-test")))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").exists());
        // Otra IP no queda afectada.
        mvc.perform(post("/api/admin/login").with(csrf()).with(ip("10.0.0.4"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credenciales("admin", "secreto-test")))
                .andExpect(status().isNoContent());
    }

    @Test
    void logoutCierraLaSesion() throws Exception {
        MockHttpSession s = AdminTestSoporte.login(mvc);
        mvc.perform(post("/api/admin/logout").session(s).with(csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/admin/yo").session(s))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutSinCsrfDa403() throws Exception {
        MockHttpSession s = AdminTestSoporte.login(mvc);
        mvc.perform(post("/api/admin/logout").session(s))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/yo").session(s))
                .andExpect(status().isOk());
    }

    @Test
    void elLoginCambiaElIdDeSesion() throws Exception {
        MockHttpSession previa = new MockHttpSession();
        String idPrevio = previa.getId();
        MockHttpSession s = (MockHttpSession) mvc.perform(post("/api/admin/login").session(previa).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credenciales("admin", "secreto-test")))
                .andExpect(status().isNoContent())
                .andReturn().getRequest().getSession(false);
        assertThat(s.getId()).isNotEqualTo(idPrevio);
    }

    @Test
    void rutasPublicasSiguenSinSesionNiCsrf() throws Exception {
        mvc.perform(get("/api/cursos")).andExpect(status().isOk());
        var r = mvc.perform(post("/api/cursos/manipulador-alimentos/intentos"))
                .andExpect(status().isCreated()).andReturn();
        assertThat(r.getRequest().getSession(false)).isNull();
    }

    @Test
    void passwordDeMasDe72BytesNoArrancaEnNingunPerfil() {
        MockEnvironment prod = new MockEnvironment();
        prod.setActiveProfiles("prod");
        String larga = "ñ".repeat(37); // 74 bytes en UTF-8 aunque solo 37 caracteres
        for (MockEnvironment env : new MockEnvironment[] {new MockEnvironment(), prod}) {
            assertThatThrownBy(() -> new AdminProperties("admin", larga).validar(env))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("La contraseña del panel no puede superar 72 bytes");
            assertThatCode(() -> new AdminProperties("admin", "a".repeat(72)).validar(env))
                    .doesNotThrowAnyException();
        }
    }

    @Test
    void prodSinCredencialesNoArranca() {
        MockEnvironment prod = new MockEnvironment();
        prod.setActiveProfiles("prod");
        assertThatThrownBy(() -> new AdminProperties("", "algo-largo").validar(prod))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new AdminProperties("admin", "").validar(prod))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new AdminProperties("admin", null).validar(prod))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new AdminProperties("admin", "admin").validar(prod))
                .isInstanceOf(IllegalStateException.class);
        assertThatCode(() -> new AdminProperties("admin", "otra-buena").validar(prod))
                .doesNotThrowAnyException();
        assertThatCode(() -> new AdminProperties("admin", "admin").validar(new MockEnvironment()))
                .doesNotThrowAnyException();
    }
}
