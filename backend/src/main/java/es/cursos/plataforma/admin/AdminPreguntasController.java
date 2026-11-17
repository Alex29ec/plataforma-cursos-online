package es.cursos.plataforma.admin;

import es.cursos.plataforma.admin.dto.DatosPreguntaDto;
import es.cursos.plataforma.admin.dto.PreguntaAdminDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cursos/{cursoId}/preguntas")
public class AdminPreguntasController {

    private final AdminContenidoService servicio;

    public AdminPreguntasController(AdminContenidoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<PreguntaAdminDto> listar(@PathVariable Long cursoId) {
        return servicio.listarPreguntas(cursoId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PreguntaAdminDto crear(@PathVariable Long cursoId, @Valid @RequestBody DatosPreguntaDto dto) {
        return servicio.crearPregunta(cursoId, dto);
    }

    @PutMapping("/{preguntaId}")
    public PreguntaAdminDto editar(@PathVariable Long cursoId, @PathVariable Long preguntaId,
                                   @Valid @RequestBody DatosPreguntaDto dto) {
        return servicio.editarPregunta(cursoId, preguntaId, dto);
    }

    @DeleteMapping("/{preguntaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable Long cursoId, @PathVariable Long preguntaId) {
        servicio.desactivarPregunta(cursoId, preguntaId);
    }
}
