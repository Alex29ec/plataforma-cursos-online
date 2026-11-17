package es.cursos.plataforma.diploma;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DiplomaRepository extends JpaRepository<Diploma, Long> {

    Optional<Diploma> findByCodigo(String codigo);

    Optional<Diploma> findByPedidoId(UUID pedidoId);

    boolean existsByCodigo(String codigo);
}
