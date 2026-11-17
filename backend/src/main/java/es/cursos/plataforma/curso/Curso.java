package es.cursos.plataforma.curso;

import jakarta.persistence.*;

@Entity
@Table(name = "curso")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String slug;
    private String titulo;
    private String descripcion;
    private int horas;
    private int precioCentimos;
    private int notaMinima;
    private int numPreguntas;
    private String resumen;
    private String imagen;
    private int orden;

    @Enumerated(EnumType.STRING)
    private EstadoCurso estado;

    protected Curso() {
    }

    /** Curso nuevo en BORRADOR con los valores por defecto del panel. */
    public static Curso nuevo(String titulo, String slug) {
        Curso c = new Curso();
        c.titulo = titulo;
        c.slug = slug;
        c.descripcion = "";
        c.horas = 10;
        c.precioCentimos = 1990;
        c.notaMinima = 75;
        c.numPreguntas = 20;
        c.orden = 100;
        c.estado = EstadoCurso.BORRADOR;
        return c;
    }

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public String getTitulo() { return titulo; }
    public String getDescripcion() { return descripcion; }
    public int getHoras() { return horas; }
    public int getPrecioCentimos() { return precioCentimos; }
    public int getNotaMinima() { return notaMinima; }
    public int getNumPreguntas() { return numPreguntas; }
    public String getResumen() { return resumen; }
    public String getImagen() { return imagen; }
    public int getOrden() { return orden; }
    public EstadoCurso getEstado() { return estado; }

    /** URL publica de la foto, o null si el curso no tiene. */
    public String getImagenUrl() { return imagen == null ? null : "/api/imagenes/" + imagen; }

    public void setSlug(String slug) { this.slug = slug; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setHoras(int horas) { this.horas = horas; }
    public void setPrecioCentimos(int precioCentimos) { this.precioCentimos = precioCentimos; }
    public void setNotaMinima(int notaMinima) { this.notaMinima = notaMinima; }
    public void setNumPreguntas(int numPreguntas) { this.numPreguntas = numPreguntas; }
    public void setResumen(String resumen) { this.resumen = resumen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
    public void setOrden(int orden) { this.orden = orden; }
    public void setEstado(EstadoCurso estado) { this.estado = estado; }
}
