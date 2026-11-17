package es.cursos.plataforma.imagen;

import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/imagenes")
public class ImagenesController {

    private final AlmacenImagenes almacen;

    public ImagenesController(AlmacenImagenes almacen) {
        this.almacen = almacen;
    }

    @GetMapping("/{nombre:.+}")
    public ResponseEntity<Resource> imagen(@PathVariable String nombre) {
        return almacen.leer(nombre)
                .map(r -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(AlmacenImagenes.tipo(nombre)))
                        .cacheControl(CacheControl.maxAge(Duration.ofDays(1)))
                        .header("X-Content-Type-Options", "nosniff")
                        .body(r))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
