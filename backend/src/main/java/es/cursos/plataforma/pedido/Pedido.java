package es.cursos.plataforma.pedido;

import es.cursos.plataforma.examen.IntentoExamen;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "intento_id")
    private IntentoExamen intento;

    private String nombre;
    private String apellidos;
    private String dni;
    private String email;
    private int importeCentimos;

    @Enumerated(EnumType.STRING)
    private EstadoPedido estado;

    private String referenciaPago;
    private Instant creadoEn;
    private Instant pagadoEn;

    protected Pedido() {
    }

    public Pedido(IntentoExamen intento, String nombre, String apellidos, String dni, String email,
                  int importeCentimos) {
        this.id = UUID.randomUUID();
        this.intento = intento;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dni = dni;
        this.email = email;
        this.importeCentimos = importeCentimos;
        this.estado = EstadoPedido.PENDIENTE_PAGO;
        this.creadoEn = Instant.now();
    }

    void asignarReferenciaPago(String referencia) {
        this.referenciaPago = referencia;
    }

    void cancelar() {
        this.estado = EstadoPedido.CANCELADO;
    }

    void marcarPagado() {
        this.estado = EstadoPedido.PAGADO;
        this.pagadoEn = Instant.now();
    }

    public void marcarEmitido() {
        if (estado != EstadoPedido.PAGADO) {
            throw new IllegalStateException("Solo se puede emitir un pedido pagado (estado " + estado + ")");
        }
        this.estado = EstadoPedido.EMITIDO;
    }

    public UUID getId() { return id; }
    public IntentoExamen getIntento() { return intento; }
    public String getNombre() { return nombre; }
    public String getApellidos() { return apellidos; }
    public String getDni() { return dni; }
    public String getEmail() { return email; }
    public int getImporteCentimos() { return importeCentimos; }
    public EstadoPedido getEstado() { return estado; }
    public String getReferenciaPago() { return referenciaPago; }
    public Instant getCreadoEn() { return creadoEn; }
    public Instant getPagadoEn() { return pagadoEn; }
}
