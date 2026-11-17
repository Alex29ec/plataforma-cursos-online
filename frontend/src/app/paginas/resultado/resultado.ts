import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Resultado as ResultadoExamen } from '../../core/modelos';

interface EstadoResultado {
  resultado: ResultadoExamen;
  intentoId: string;
  /** Curso del examen; los enlaces de repaso y repetición van a él. */
  slug?: string;
}

@Component({
  selector: 'app-resultado',
  imports: [RouterLink],
  template: `
    @if (datos; as d) {
      <div class="contenedor pagina">
        <div class="tarjeta resultado" [class.aprobado]="d.resultado.aprobado">
          <p class="icono" aria-hidden="true">{{ d.resultado.aprobado ? '🎉' : '📚' }}</p>
          <h1>{{ d.resultado.aprobado ? '¡Has aprobado!' : 'No has aprobado esta vez' }}</h1>
          <p class="nota">{{ d.resultado.nota }}<span>/100</span></p>
          <p class="suave">
            {{ d.resultado.aciertos }} de {{ d.resultado.total }} respuestas correctas ·
            nota mínima {{ d.resultado.notaMinima }}
          </p>
          <div class="acciones centro">
            @if (d.resultado.aprobado) {
              <a class="boton" [routerLink]="['/intento', d.intentoId, 'datos']">Obtener mi diploma</a>
            } @else {
              @if (d.slug) {
                <a class="boton secundario" [routerLink]="['/cursos', d.slug]">Repasar el curso</a>
                <a class="boton" [routerLink]="['/cursos', d.slug, 'examen']">Repetir el examen</a>
              } @else {
                <a class="boton" routerLink="/" fragment="cursos">Ver los cursos</a>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .resultado { text-align: center; max-width: 560px; margin: 0 auto; border-top: 6px solid var(--color-acento); }
    .resultado.aprobado { border-top-color: var(--color-ok); }
    .icono { font-size: 2.5em; margin: 0; }
    .nota { font-size: 3.2em; font-weight: 800; margin: 0; color: var(--color-texto); }
    .nota span { font-size: 0.4em; color: var(--color-suave); font-weight: 600; }
    .centro { justify-content: center; }
  `,
})
export class ResultadoPagina {
  private readonly router = inject(Router);
  protected readonly datos = this.router.currentNavigation()?.extras.state as EstadoResultado | undefined
    ?? (history.state?.resultado ? (history.state as EstadoResultado) : undefined);

  constructor() {
    if (!this.datos) {
      this.router.navigate(['/']);
    }
  }
}
