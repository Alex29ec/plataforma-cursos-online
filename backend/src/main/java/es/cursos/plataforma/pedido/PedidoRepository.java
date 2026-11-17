package es.cursos.plataforma.pedido;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    List<Pedido> findByIntentoId(UUID intentoId);

    /** Bloquea los pedidos del intento para no pisar un pago que se este confirmando a la vez. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pedido p where p.intento.id = :intentoId")
    List<Pedido> findByIntentoIdParaActualizar(UUID intentoId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pedido p where p.referenciaPago = :referencia")
    Optional<Pedido> findPorReferenciaParaActualizar(String referencia);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pedido p where p.id = :id")
    Optional<Pedido> findParaActualizar(UUID id);
}
