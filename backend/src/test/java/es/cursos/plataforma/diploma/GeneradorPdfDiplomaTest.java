package es.cursos.plataforma.diploma;

import es.cursos.plataforma.ApoyoTests;
import es.cursos.plataforma.pago.ProveedorPago;
import es.cursos.plataforma.pago.SesionPago;
import es.cursos.plataforma.pedido.Pedido;
import es.cursos.plataforma.pedido.PedidoRepository;
import es.cursos.plataforma.pedido.PedidoService;
import es.cursos.plataforma.pedido.dto.DatosAlumnoDto;
import org.junit.jupiter.api.Test;
import org.openpdf.text.pdf.PdfReader;
import org.openpdf.text.pdf.parser.PdfTextExtractor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Import(ApoyoTests.class)
class GeneradorPdfDiplomaTest {

    @Autowired
    GeneradorPdfDiploma generador;
    @Autowired
    ApoyoTests apoyo;
    @Autowired
    PedidoService pedidoService;
    @Autowired
    PedidoRepository pedidos;

    @Test
    @Transactional
    void generaPdfConNombreCodigoYHoras() throws Exception {
        UUID id = pedidoService.crear(apoyo.intentoAprobado(),
                new DatosAlumnoDto("Lucía", "Martínez Ruiz", "12345678Z", "lucia@example.com", true)).pedidoId();
        Pedido pedido = pedidos.findById(id).orElseThrow();
        Diploma diploma = new Diploma(pedido, "MA-7K3P-Q9XD", "token", Instant.parse("2026-11-16T10:00:00Z"));

        byte[] pdf = generador.generar(pedido, diploma);

        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
        PdfReader reader = new PdfReader(pdf);
        String texto = new PdfTextExtractor(reader).getTextFromPage(1);
        assertThat(texto).contains("Certificado de formación: Curso de Manipulador de Alimentos").doesNotContain("en Manipulación de Alimentos");
        assertThat(texto).contains("Lucía", "Martínez Ruiz", "MA-7K3P-Q9XD", "10 horas", "16/11/2026", "12345678Z");
    }
}
