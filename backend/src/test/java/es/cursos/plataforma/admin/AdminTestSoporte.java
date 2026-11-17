package es.cursos.plataforma.admin;

import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Apoyo para tests de administración: hace login y devuelve la sesión ya autenticada. */
public final class AdminTestSoporte {

    public static final String USUARIO = "admin";
    public static final String PASSWORD = "secreto-test";

    private AdminTestSoporte() {
    }

    /** Uso: {@code mvc.perform(get("/api/admin/...").session(s).with(csrf()))}. */
    public static MockHttpSession login(MockMvc mvc) throws Exception {
        return (MockHttpSession) mvc.perform(post("/api/admin/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usuario\":\"" + USUARIO + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isNoContent())
                .andReturn().getRequest().getSession(false);
    }
}
