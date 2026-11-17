package es.cursos.plataforma.examen;

import es.cursos.plataforma.curso.dto.CursoResumenDto;
import es.cursos.plataforma.examen.dto.EntregaDto;
import es.cursos.plataforma.examen.dto.IntentoCreadoDto;
import es.cursos.plataforma.examen.dto.ResultadoDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ExamenController {

    private final ExamenService examen;

    public ExamenController(ExamenService examen) {
        this.examen = examen;
    }

    @PostMapping("/cursos/{slug}/intentos")
    @ResponseStatus(HttpStatus.CREATED)
    public IntentoCreadoDto crear(@PathVariable String slug) {
        return examen.crearIntento(slug);
    }

    @GetMapping("/intentos/{id}/curso")
    public CursoResumenDto cursoDeIntento(@PathVariable UUID id) {
        return examen.cursoDeIntento(id);
    }

    @PostMapping("/intentos/{id}/entrega")
    public ResultadoDto entregar(@PathVariable UUID id, @RequestBody EntregaDto entrega) {
        return examen.entregar(id, entrega.respuestas());
    }
}
