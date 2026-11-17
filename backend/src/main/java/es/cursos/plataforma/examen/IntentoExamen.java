package es.cursos.plataforma.examen;

import es.cursos.plataforma.curso.Curso;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "intento_examen")
public class IntentoExamen {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id")
    private Curso curso;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "intento_pregunta", joinColumns = @JoinColumn(name = "intento_id"))
    @OrderColumn(name = "posicion")
    @Column(name = "pregunta_id")
    private List<Long> preguntaIds = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "intento_respuesta", joinColumns = @JoinColumn(name = "intento_id"))
    @MapKeyColumn(name = "pregunta_id")
    @Column(name = "opcion")
    private Map<Long, Integer> respuestas = new HashMap<>();

    private Integer nota;
    private boolean aprobado;
    private Instant iniciadoEn;
    private Instant entregadoEn;

    protected IntentoExamen() {
    }

    public IntentoExamen(Curso curso, List<Long> preguntaIds) {
        this.id = UUID.randomUUID();
        this.curso = curso;
        this.preguntaIds = new ArrayList<>(preguntaIds);
        this.iniciadoEn = Instant.now();
    }

    void registrarEntrega(Map<Long, Integer> respuestas, int nota, boolean aprobado) {
        this.respuestas = new HashMap<>(respuestas);
        this.nota = nota;
        this.aprobado = aprobado;
        this.entregadoEn = Instant.now();
    }

    public boolean isEntregado() { return entregadoEn != null; }
    public UUID getId() { return id; }
    public Curso getCurso() { return curso; }
    public List<Long> getPreguntaIds() { return preguntaIds; }
    public Map<Long, Integer> getRespuestas() { return respuestas; }
    public Integer getNota() { return nota; }
    public boolean isAprobado() { return aprobado; }
    public Instant getIniciadoEn() { return iniciadoEn; }
    public Instant getEntregadoEn() { return entregadoEn; }
}
