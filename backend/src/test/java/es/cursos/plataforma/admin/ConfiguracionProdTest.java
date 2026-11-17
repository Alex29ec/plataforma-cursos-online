package es.cursos.plataforma.admin;

import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.FileSystemResource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * El perfil prod va detrás de un proxy inverso con HTTPS: lo comprobamos sobre el propio fichero.
 * Se leen los ficheros de src/main porque en el classpath de test application.yml es el de src/test.
 */
class ConfiguracionProdTest {

    private static Object prop(String fichero, String nombre) throws Exception {
        List<PropertySource<?>> fuentes = new YamlPropertySourceLoader().load(fichero, new FileSystemResource("src/main/resources/" + fichero));
        return fuentes.stream().map(f -> f.getProperty(nombre)).filter(v -> v != null).findFirst().orElse(null);
    }

    @Test
    void prodConfiaEnLasCabecerasDelProxyYMarcaLaCookieDeSesionComoSecure() throws Exception {
        assertThat(String.valueOf(prop("application-prod.yml", "server.forward-headers-strategy"))).isEqualTo("native");
        assertThat(String.valueOf(prop("application-prod.yml", "server.servlet.session.cookie.secure"))).isEqualTo("true");
    }

    @Test
    void laCarpetaDeFotosSeConfiguraConAppUploadsDir() throws Exception {
        assertThat(String.valueOf(prop("application.yml", "app.uploads-dir"))).isEqualTo("${APP_UPLOADS_DIR:./uploads}");
    }
}
