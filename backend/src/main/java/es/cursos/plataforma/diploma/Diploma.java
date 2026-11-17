package es.cursos.plataforma.diploma;

import es.cursos.plataforma.pedido.Pedido;
import jakarta.persistence.*;

import java.time.Instant;

/** El PDF no se guarda: se genera al descargarlo a partir de estos datos. */
@Entity
@Table(name = "diploma")
public class Diploma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    private String codigo;
    private Instant emitidoEn;
    private String tokenDescarga;

    protected Diploma() {
    }

    public Diploma(Pedido pedido, String codigo, String tokenDescarga, Instant emitidoEn) {
        this.pedido = pedido;
        this.codigo = codigo;
        this.tokenDescarga = tokenDescarga;
        this.emitidoEn = emitidoEn;
    }

    public Long getId() { return id; }
    public Pedido getPedido() { return pedido; }
    public String getCodigo() { return codigo; }
    public Instant getEmitidoEn() { return emitidoEn; }
    public String getTokenDescarga() { return tokenDescarga; }
}
