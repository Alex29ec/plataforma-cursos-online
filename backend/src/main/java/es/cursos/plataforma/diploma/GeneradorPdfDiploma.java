package es.cursos.plataforma.diploma;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import es.cursos.plataforma.curso.Curso;
import es.cursos.plataforma.curso.Tema;
import es.cursos.plataforma.curso.TemaRepository;
import es.cursos.plataforma.pedido.Pedido;
import org.openpdf.text.*;
import org.openpdf.text.pdf.PdfContentByte;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/** Plantilla PROVISIONAL del diploma (A4 apaisado). */
@Component
public class GeneradorPdfDiploma {

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy")
            .withZone(ZoneId.of("Europe/Madrid"));
    private static final Color AZUL = new Color(0x1F, 0x4E, 0x79);
    private static final Color GRIS = new Color(0x55, 0x55, 0x55);

    private final TemaRepository temas;
    private final String frontendUrl;

    public GeneradorPdfDiploma(TemaRepository temas, @Value("${app.frontend-url}") String frontendUrl) {
        this.temas = temas;
        this.frontendUrl = frontendUrl;
    }

    @Transactional(readOnly = true)
    public byte[] generar(Pedido pedido, Diploma diploma) {
        Curso curso = pedido.getIntento().getCurso();
        List<Tema> listaTemas = temas.findByCursoOrderByOrdenAsc(curso);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 60, 60, 50, 50);
        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();
            marco(writer.getDirectContent(), doc);

            parrafo(doc, "DIPLOMA", fuente(34, Font.BOLD, AZUL), 4);
            parrafo(doc, "Certificado de formación: " + curso.getTitulo(), fuente(15, Font.NORMAL, GRIS), 22);
            parrafo(doc, "Se certifica que", fuente(12, Font.NORMAL, GRIS), 6);
            parrafo(doc, pedido.getNombre() + " " + pedido.getApellidos(), fuente(24, Font.BOLD, Color.BLACK), 4);
            parrafo(doc, "con DNI/NIE " + pedido.getDni(), fuente(12, Font.NORMAL, GRIS), 14);
            parrafo(doc, "ha superado el " + curso.getTitulo() + ", con una duración de " + curso.getHoras()
                    + " horas, con fecha " + FECHA.format(diploma.getEmitidoEn()) + ".",
                    fuente(12, Font.NORMAL, Color.BLACK), 14);
            parrafo(doc, "Contenidos: " + listaTemas.stream().map(Tema::getTitulo).collect(Collectors.joining(" · ")),
                    fuente(9, Font.NORMAL, GRIS), 0);

            pie(writer.getDirectContent(), doc, diploma);
            doc.close();
        } catch (DocumentException | WriterException e) {
            throw new IllegalStateException("No se pudo generar el diploma " + diploma.getCodigo(), e);
        }
        return out.toByteArray();
    }

    private static Font fuente(float tam, int estilo, Color color) {
        return new Font(Font.HELVETICA, tam, estilo, color);
    }

    private static void parrafo(Document doc, String texto, Font fuente, float espacioDespues) {
        Paragraph p = new Paragraph(texto, fuente);
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingAfter(espacioDespues);
        doc.add(p);
    }

    private static void marco(PdfContentByte cb, Document doc) {
        Rectangle r = doc.getPageSize();
        cb.setColorStroke(AZUL);
        cb.setLineWidth(3f);
        cb.rectangle(25, 25, r.getWidth() - 50, r.getHeight() - 50);
        cb.stroke();
        cb.setLineWidth(0.8f);
        cb.rectangle(32, 32, r.getWidth() - 64, r.getHeight() - 64);
        cb.stroke();
    }

    private void pie(PdfContentByte cb, Document doc, Diploma diploma) throws WriterException {
        float ancho = doc.getPageSize().getWidth();
        String url = frontendUrl + "/verificar/" + diploma.getCodigo();

        // QR de verificacion (dibujado como vectores)
        float tamQr = 90;
        float xQr = 60;
        float yQr = 55;
        qr(cb, url, xQr, yQr, tamQr);
        texto(cb, "Código: " + diploma.getCodigo(), xQr + tamQr + 10, yQr + 50, 10, Element.ALIGN_LEFT, Color.BLACK);
        texto(cb, "Verificar en: " + url, xQr + tamQr + 10, yQr + 34, 8, Element.ALIGN_LEFT, GRIS);

        // Firma y sello
        float xFirma = ancho - 260;
        cb.setColorStroke(GRIS);
        cb.setLineWidth(0.6f);
        cb.rectangle(xFirma, 60, 190, 80);
        cb.stroke();
        texto(cb, "Firma y sello del emisor", xFirma + 95, 66, 9, Element.ALIGN_CENTER, GRIS);

        texto(cb, "PLANTILLA PROVISIONAL", ancho / 2, 38, 8, Element.ALIGN_CENTER, Color.RED);
    }

    private static void qr(PdfContentByte cb, String contenido, float x, float y, float tam) throws WriterException {
        BitMatrix m = new QRCodeWriter().encode(contenido, BarcodeFormat.QR_CODE, 0, 0);
        float modulo = tam / m.getWidth();
        cb.setColorFill(Color.BLACK);
        for (int fila = 0; fila < m.getHeight(); fila++) {
            for (int col = 0; col < m.getWidth(); col++) {
                if (m.get(col, fila)) {
                    cb.rectangle(x + col * modulo, y + tam - (fila + 1) * modulo, modulo, modulo);
                }
            }
        }
        cb.fill();
    }

    private static void texto(PdfContentByte cb, String texto, float x, float y, float tam, int alineacion, Color color) {
        Font f = fuente(tam, Font.NORMAL, color);
        org.openpdf.text.pdf.ColumnText.showTextAligned(cb, alineacion, new Phrase(texto, f), x, y, 0);
    }
}
