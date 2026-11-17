package es.cursos.plataforma.curso;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pregunta")
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id")
    private Curso curso;

    private String enunciado;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pregunta_opcion", joinColumns = @JoinColumn(name = "pregunta_id"))
    @OrderColumn(name = "posicion")
    @Column(name = "texto")
    private List<String> opciones = new ArrayList<>();

    /** Indice (desde 0) de la opcion correcta. Nunca se envia al cliente. */
    private int correcta;

    private boolean activa = true;

    protected Pregunta() {
    }

    public Long getId() { return id; }
    public Curso getCurso() { return curso; }
    public String getEnunciado() { return enunciado; }
    public List<String> getOpciones() { return opciones; }
    public int getCorrecta() { return correcta; }
    public boolean isActiva() { return activa; }

    public Pregunta(Curso curso, String enunciado, List<String> opciones, int correcta) {
        this.curso = curso;
        this.enunciado = enunciado;
        this.opciones = new ArrayList<>(opciones);
        this.correcta = correcta;
    }

    public void setActiva(boolean activa) { this.activa = activa; }
    public void setEnunciado(String enunciado) { this.enunciado = enunciado; }
    public void setCorrecta(int correcta) { this.correcta = correcta; }

    public void setOpciones(List<String> nuevas) {
        opciones.clear();
        opciones.addAll(nuevas);
    }
}
