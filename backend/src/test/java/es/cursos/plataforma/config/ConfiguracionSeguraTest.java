package es.cursos.plataforma.config;

import es.cursos.plataforma.pago.SimuladoProveedorPago;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mock.env.MockEnvironment;

import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** El pago simulado debe ser opcional y explicito, nunca lo que se activa por omision. */
class ConfiguracionSeguraTest {

    static Properties yaml(String fichero) {
        YamlPropertiesFactoryBean f = new YamlPropertiesFactoryBean();
        f.setResources(new FileSystemResource("src/main/resources/" + fichero));
        return f.getObject();
    }

    @Test
    void porDefectoElProveedorEsStripeYNoHayBaseDeDatosLocal() {
        Properties base = yaml("application.yml");
        assertThat(base.getProperty("app.pagos.proveedor")).isEqualTo("stripe");
        assertThat(base.getProperty("spring.datasource.url")).isNull();
    }

    @Test
    void elPerfilLocalActivaElPagoSimuladoYH2() {
        Properties local = yaml("application-local.yml");
        assertThat(local.getProperty("app.pagos.proveedor")).isEqualTo("simulado");
        assertThat(local.getProperty("spring.datasource.url")).startsWith("jdbc:h2:");
    }

    @Test
    void elPagoSimuladoNoArrancaConElPerfilProd() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        assertThatThrownBy(() -> new SimuladoProveedorPago("http://x", env))
                .isInstanceOf(IllegalStateException.class);
    }
}
