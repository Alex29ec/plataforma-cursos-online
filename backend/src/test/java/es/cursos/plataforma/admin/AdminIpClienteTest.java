package es.cursos.plataforma.admin;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * En producción todas las peticiones llegan desde el proxy inverso. Con
 * {@code server.forward-headers-strategy=native} (como en application-prod.yml) Tomcat toma la IP del
 * cliente de X-Forwarded-For (su RemoteIpValve solo confía en proxies de rangos internos; aquí 127.0.0.1),
 * así que el limitador de intentos bloquea al cliente y no al proxy. Servidor real porque MockMvc no
 * pasa por las válvulas de Tomcat.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "server.forward-headers-strategy=native")
class AdminIpClienteTest {

    @Autowired
    Environment env;

    private final HttpClient http = HttpClient.newHttpClient();
    private String base;
    private String xsrf;

    @BeforeEach
    void preparar() throws Exception {
        base = "http://127.0.0.1:" + env.getProperty("local.server.port");
        HttpResponse<Void> r = http.send(HttpRequest.newBuilder(URI.create(base + "/api/admin/csrf")).GET().build(),
                HttpResponse.BodyHandlers.discarding());
        xsrf = r.headers().allValues("Set-Cookie").stream()
                .filter(c -> c.startsWith("XSRF-TOKEN="))
                .map(c -> c.substring("XSRF-TOKEN=".length(), c.indexOf(';')))
                .findFirst().orElseThrow();
    }

    private int login(String ipCliente, String password) throws Exception {
        String cuerpo = "{\"usuario\":\"admin\",\"password\":\"" + password + "\"}";
        HttpRequest req = HttpRequest.newBuilder(URI.create(base + "/api/admin/login"))
                .header("Content-Type", "application/json")
                .header("Cookie", "XSRF-TOKEN=" + xsrf)
                .header("X-XSRF-TOKEN", xsrf)
                .header("X-Forwarded-For", ipCliente)
                .header("X-Forwarded-Proto", "https")
                .POST(HttpRequest.BodyPublishers.ofString(cuerpo))
                .build();
        return http.send(req, HttpResponse.BodyHandlers.discarding()).statusCode();
    }

    @Test
    void elLimitadorBloqueaAlClienteDeXForwardedForYNoAlProxy() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertThat(login("203.0.113.5", "mala" + i)).isEqualTo(401);
        }
        assertThat(login("203.0.113.5", AdminTestSoporte.PASSWORD)).isEqualTo(429);
        // Mismo proxy (127.0.0.1), otro cliente: puede entrar.
        assertThat(login("203.0.113.6", AdminTestSoporte.PASSWORD)).isEqualTo(204);
    }
}
