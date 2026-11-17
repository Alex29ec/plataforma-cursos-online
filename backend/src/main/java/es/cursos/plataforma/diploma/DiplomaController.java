package es.cursos.plataforma.diploma;

import es.cursos.plataforma.comun.DniNie;
import es.cursos.plataforma.comun.NoEncontradoException;
import es.cursos.plataforma.diploma.dto.VerificacionDto;
import es.cursos.plataforma.pedido.Pedido;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api")
@Transactional(readOnly = true)
public class DiplomaController {

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ISO_LOCAL_DATE
            .withZone(ZoneId.of("Europe/Madrid"));

    private final DiplomaRepository diplomas;
    private final GeneradorPdfDiploma generador;

    public DiplomaController(DiplomaRepository diplomas, GeneradorPdfDiploma generador) {
        this.diplomas = diplomas;
        this.generador = generador;
    }

    @GetMapping("/diplomas/{codigo}/pdf")
    public ResponseEntity<byte[]> descargar(@PathVariable String codigo,
                                            @RequestParam(required = false) String token) {
        Diploma d = diplomas.findByCodigo(CodigoDiploma.normalizar(codigo))
                .filter(x -> token != null && iguales(x.getTokenDescarga(), token))
                .orElseThrow(() -> new NoEncontradoException("Diploma no encontrado"));
        byte[] pdf = generador.generar(d.getPedido(), d);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename("diploma-" + d.getCodigo() + ".pdf").build().toString())
                .body(pdf);
    }

    @GetMapping("/verificar/{codigo}")
    public VerificacionDto verificar(@PathVariable String codigo) {
        return diplomas.findByCodigo(CodigoDiploma.normalizar(codigo))
                .map(d -> {
                    Pedido p = d.getPedido();
                    var curso = p.getIntento().getCurso();
                    return new VerificacionDto(true, d.getCodigo(), p.getNombre() + " " + p.getApellidos(),
                            DniNie.enmascarar(p.getDni()), curso.getTitulo(), curso.getHoras(),
                            FECHA.format(d.getEmitidoEn()));
                })
                .orElseGet(VerificacionDto::noValido);
    }

    private static boolean iguales(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
