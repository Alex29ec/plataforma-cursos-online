package es.cursos.plataforma.comun;

import java.util.regex.Pattern;

/** Validacion y formato de DNI y NIE espanoles. */
public final class DniNie {

    private static final String LETRAS = "TRWAGMYFPDXBNJZSQVHLCKE";
    private static final Pattern DNI = Pattern.compile("\\d{8}[A-Z]");
    private static final Pattern NIE = Pattern.compile("[XYZ]\\d{7}[A-Z]");

    private DniNie() {
    }

    /** Mayusculas, sin espacios ni guiones. Devuelve "" si es null. */
    public static String normalizar(String valor) {
        if (valor == null) {
            return "";
        }
        return valor.replaceAll("[\\s-]", "").toUpperCase();
    }

    public static boolean esValido(String valor) {
        String v = normalizar(valor);
        String numero;
        if (DNI.matcher(v).matches()) {
            numero = v.substring(0, 8);
        } else if (NIE.matcher(v).matches()) {
            numero = "XYZ".indexOf(v.charAt(0)) + v.substring(1, 8);
        } else {
            return false;
        }
        return LETRAS.charAt(Integer.parseInt(numero) % 23) == v.charAt(8);
    }

    /** Deja visibles solo las posiciones 4 a 7 (p. ej. 12345678Z -> ***4567**). */
    public static String enmascarar(String valor) {
        String v = normalizar(valor);
        if (v.length() != 9) {
            return "*********";
        }
        return "***" + v.substring(3, 7) + "**";
    }
}
