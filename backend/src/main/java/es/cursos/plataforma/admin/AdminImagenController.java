package es.cursos.plataforma.admin;

import es.cursos.plataforma.admin.dto.CursoAdminDto;
import es.cursos.plataforma.comun.PeticionInvalidaException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;

@RestController
@RequestMapping("/api/admin/cursos/{id}/imagen")
public class AdminImagenController {

    static final long MAX_BYTES = 5L * 1024 * 1024;

    private final AdminCursosService servicio;

    public AdminImagenController(AdminCursosService servicio) {
        this.servicio = servicio;
    }

    @PostMapping
    public CursoAdminDto subir(@PathVariable Long id, @RequestParam("fichero") MultipartFile fichero) {
        if (fichero.getSize() > MAX_BYTES) {
            throw new PeticionInvalidaException("La imagen supera 5 MB");
        }
        try {
            return servicio.ponerImagen(id, fichero.getBytes());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @DeleteMapping
    public CursoAdminDto quitar(@PathVariable Long id) {
        return servicio.quitarImagen(id);
    }
}
