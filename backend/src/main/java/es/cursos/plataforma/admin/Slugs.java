package es.cursos.plataforma.admin;

import java.text.Normalizer;
import java.util.Locale;

public final class Slugs {

    private Slugs() {
    }

    public static String conSufijo(String base, int n) {
        String sufijo = "-" + n;
        String recorte = base.length() > 100 - sufijo.length() ? base.substring(0, 100 - sufijo.length()) : base;
        return recorte.replaceAll("-+$", "") + sufijo;
    }

    /** Minusculas, sin acentos, lo no alfanumerico pasa a '-' (sin repetir ni en los extremos). */
    public static String desde(String titulo) {
        String s = Normalizer.normalize(titulo == null ? "" : titulo, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (s.length() > 100) {
            s = s.substring(0, 100).replaceAll("-+$", "");
        }
        return s.isEmpty() ? "curso" : s;
    }
}
