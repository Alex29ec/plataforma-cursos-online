package es.cursos.plataforma.admin;

import es.cursos.plataforma.admin.dto.CambioEstadoDto;
import es.cursos.plataforma.admin.dto.CursoAdminDto;
import es.cursos.plataforma.admin.dto.CursoAdminResumenDto;
import es.cursos.plataforma.admin.dto.DatosCursoDto;
import es.cursos.plataforma.admin.dto.NuevoCursoDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cursos")
public class AdminCursosController {

    private final AdminCursosService servicio;

    public AdminCursosController(AdminCursosService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<CursoAdminResumenDto> listar() {
        return servicio.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CursoAdminDto crear(@Valid @RequestBody NuevoCursoDto dto) {
        return servicio.crear(dto.titulo());
    }

    @GetMapping("/{id}")
    public CursoAdminDto obtener(@PathVariable Long id) {
        return servicio.obtener(id);
    }

    @PutMapping("/{id}")
    public CursoAdminDto actualizar(@PathVariable Long id, @Valid @RequestBody DatosCursoDto dto) {
        return servicio.actualizar(id, dto);
    }

    @PutMapping("/{id}/estado")
    public CursoAdminDto estado(@PathVariable Long id, @Valid @RequestBody CambioEstadoDto dto) {
        return servicio.cambiarEstado(id, dto.estado());
    }
}
