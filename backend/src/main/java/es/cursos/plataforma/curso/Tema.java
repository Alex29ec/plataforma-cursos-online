package es.cursos.plataforma.curso;

import jakarta.persistence.*;

@Entity
@Table(name = "tema")
public class Tema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id")
    private Curso curso;

    private int orden;
    private String titulo;
    private String contenido;

    protected Tema() {
    }

    public Tema(Curso curso, int orden, String titulo, String contenido) {
        this.curso = curso;
        this.orden = orden;
        this.titulo = titulo;
        this.contenido = contenido;
    }

    public void setOrden(int orden) { this.orden = orden; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public Long getId() { return id; }
    public Curso getCurso() { return curso; }
    public int getOrden() { return orden; }
    public String getTitulo() { return titulo; }
    public String getContenido() { return contenido; }
}
