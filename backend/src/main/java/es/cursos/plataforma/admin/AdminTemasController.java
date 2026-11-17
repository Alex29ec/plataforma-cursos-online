package es.cursos.plataforma.admin;

import es.cursos.plataforma.admin.dto.DatosTemaDto;
import es.cursos.plataforma.admin.dto.OrdenTemasDto;
import es.cursos.plataforma.admin.dto.TemaAdminDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cursos/{cursoId}/temas")
public class AdminTemasController {

    private final AdminContenidoService servicio;

    public AdminTemasController(AdminContenidoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<TemaAdminDto> listar(@PathVariable Long cursoId) {
        return servicio.listarTemas(cursoId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TemaAdminDto crear(@PathVariable Long cursoId, @Valid @RequestBody DatosTemaDto dto) {
        return servicio.crearTema(cursoId, dto);
    }

    @PutMapping("/orden")
    public List<TemaAdminDto> reordenar(@PathVariable Long cursoId, @Valid @RequestBody OrdenTemasDto dto) {
        return servicio.reordenarTemas(cursoId, dto.ids());
    }

    @PutMapping("/{temaId}")
    public TemaAdminDto editar(@PathVariable Long cursoId, @PathVariable Long temaId,
                               @Valid @RequestBody DatosTemaDto dto) {
        return servicio.editarTema(cursoId, temaId, dto);
    }

    @DeleteMapping("/{temaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable Long cursoId, @PathVariable Long temaId) {
        servicio.borrarTema(cursoId, temaId);
    }
}
