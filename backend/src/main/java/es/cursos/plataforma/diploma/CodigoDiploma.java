package es.cursos.plataforma.diploma;

import java.security.SecureRandom;
import java.util.Base64;

/** Codigos de verificacion (CO-XXXX-XXXX; se siguen aceptando los antiguos MA-) y tokens de descarga. */
public final class CodigoDiploma {

    /** Sin 0/O, 1/I/L para que no se confundan al teclearlos. */
    private static final String ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    private CodigoDiploma() {
    }

    public static String generar() {
        return "CO-" + bloque() + "-" + bloque();
    }

    /** Mayusculas, sin espacios; acepta espacios en lugar de guiones. */
    public static String normalizar(String codigo) {
        if (codigo == null) {
            return "";
        }
        String limpio = codigo.trim().toUpperCase().replaceAll("[\\s-]+", "");
        if (limpio.matches("[A-Z]{2}.{8}")) {
            return limpio.substring(0, 2) + "-" + limpio.substring(2, 6) + "-" + limpio.substring(6);
        }
        return limpio;
    }

    public static String token() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String bloque() {
        StringBuilder sb = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            sb.append(ALFABETO.charAt(RANDOM.nextInt(ALFABETO.length())));
        }
        return sb.toString();
    }
}
