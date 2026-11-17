package es.cursos.plataforma.admin;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Flujo CSRF real, como lo hace Angular: cookie XSRF-TOKEN → cabecera X-XSRF-TOKEN.
 * Contexto propio y sin {@code csrf()}: ese post-procesador de spring-security-test sustituye
 * el repositorio de tokens del contexto compartido por uno en sesión.
 */
@SpringBootTest(properties = "app.admin.usuario=admin")
@AutoConfigureMockMvc
class AdminCsrfCookieTest {

    @Autowired
    MockMvc mvc;

    @Test
    void csrfDejaLaCookieYElLoginLaAceptaComoCabecera() throws Exception {
        Cookie xsrf = mvc.perform(get("/api/admin/csrf"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andExpect(cookie().httpOnly("XSRF-TOKEN", false))
                .andReturn().getResponse().getCookie("XSRF-TOKEN");
        String login = "{\"usuario\":\"admin\",\"password\":\"secreto-test\"}";

        mvc.perform(post("/api/admin/login").cookie(xsrf).header("X-XSRF-TOKEN", "otro")
                        .contentType(MediaType.APPLICATION_JSON).content(login))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/login").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .contentType(MediaType.APPLICATION_JSON).content(login))
                .andExpect(status().isNoContent());
    }
}
