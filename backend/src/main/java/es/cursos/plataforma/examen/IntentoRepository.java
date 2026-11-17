package es.cursos.plataforma.examen;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface IntentoRepository extends JpaRepository<IntentoExamen, UUID> {

    /** Bloquea la fila para que dos entregas simultaneas no se pisen. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from IntentoExamen i where i.id = :id")
    Optional<IntentoExamen> findParaActualizar(UUID id);
}
