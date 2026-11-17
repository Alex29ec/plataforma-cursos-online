package es.cursos.plataforma.imagen;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Guarda las imágenes subidas. El tipo se decide por la cabecera real del fichero (nunca por el nombre
 * o el Content-Type del cliente) y el nombre en disco es siempre {@code {uuid}.{ext}}.
 */
@Component
public class AlmacenImagenes {

    private static final Pattern NOMBRE = Pattern.compile("^[0-9a-f-]{36}\\.(jpg|png|webp)$");

    private final Path dir;

    public AlmacenImagenes(@Value("${app.uploads-dir:./uploads}") String dir) {
        this.dir = Path.of(dir).toAbsolutePath().normalize();
    }

    /** @throws IllegalArgumentException si los bytes no son un JPG, PNG o WebP. */
    public String guardar(byte[] datos) {
        String ext = extension(datos);
        if (ext == null) {
            throw new IllegalArgumentException("Formato de imagen no válido (solo JPG, PNG o WebP)");
        }
        String nombre = UUID.randomUUID() + "." + ext;
        try {
            Files.createDirectories(dir);
            Files.write(dir.resolve(nombre), datos);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return nombre;
    }

    public Optional<Resource> leer(String nombre) {
        Path p = resolver(nombre);
        if (p == null || !Files.isRegularFile(p)) {
            return Optional.empty();
        }
        return Optional.of(new FileSystemResource(p));
    }

    public void borrar(String nombre) {
        Path p = resolver(nombre);
        if (p == null) {
            return;
        }
        try {
            Files.deleteIfExists(p);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** Tipo MIME correspondiente a un nombre ya validado. */
    public static String tipo(String nombre) {
        if (nombre.endsWith(".png")) {
            return "image/png";
        }
        return nombre.endsWith(".webp") ? "image/webp" : "image/jpeg";
    }

    private Path resolver(String nombre) {
        if (nombre == null || !NOMBRE.matcher(nombre).matches()) {
            return null;
        }
        Path p = dir.resolve(nombre).normalize();
        return p.startsWith(dir) ? p : null;
    }

    private static String extension(byte[] d) {
        if (d == null) {
            return null;
        }
        if (d.length >= 3 && (d[0] & 0xFF) == 0xFF && (d[1] & 0xFF) == 0xD8 && (d[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (d.length >= 8 && (d[0] & 0xFF) == 0x89 && d[1] == 'P' && d[2] == 'N' && d[3] == 'G'
                && d[4] == 0x0D && d[5] == 0x0A && d[6] == 0x1A && d[7] == 0x0A) {
            return "png";
        }
        if (d.length >= 12 && d[0] == 'R' && d[1] == 'I' && d[2] == 'F' && d[3] == 'F'
                && d[8] == 'W' && d[9] == 'E' && d[10] == 'B' && d[11] == 'P') {
            return "webp";
        }
        return null;
    }
}
