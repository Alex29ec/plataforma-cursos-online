package es.cursos.plataforma.admin;

import es.cursos.plataforma.comun.ConflictoException;
import es.cursos.plataforma.curso.Curso;

/** Condiciones que debe cumplir un curso para estar publicado. */
public final class ReglasPublicacion {

    private ReglasPublicacion() {
    }

    public static void verificar(Curso c, int temas, long preguntasActivas) {
        if (temas < 1) {
            throw new ConflictoException("Añade al menos un tema");
        }
        if (c.getNumPreguntas() < 1) {
            throw new ConflictoException("El examen debe tener al menos una pregunta");
        }
        if (preguntasActivas < c.getNumPreguntas()) {
            throw new ConflictoException("Hay " + preguntasActivas + " preguntas activas y el examen usa "
                    + c.getNumPreguntas());
        }
    }
}
