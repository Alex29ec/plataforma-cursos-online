import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Curso } from '../../core/modelos';

@Component({
  selector: 'app-indice',
  imports: [RouterLink],
  template: `
    <div class="contenedor pagina">
      @if (curso(); as c) {
        @if (c === 'error') {
          <div class="aviso error">Este curso no está disponible. <a routerLink="/" fragment="cursos">Ver todos los cursos</a></div>
        } @else {
          <a [routerLink]="['/cursos', c.slug]" class="volver">← {{ c.titulo }}</a>
          <h1>Temario</h1>
          <p class="suave">{{ c.temas.length }} temas · {{ c.horas }} horas. Léelos en el orden que quieras.</p>
          <ol class="lista tarjeta">
            @for (t of c.temas; track t.orden) {
              <li>
                <a [routerLink]="['/cursos', c.slug, 'tema', t.orden]"><span class="n">Tema {{ t.orden }}</span>{{ t.titulo }}</a>
              </li>
            }
          </ol>
          <div class="acciones">
            <a class="boton" [routerLink]="['/cursos', c.slug, 'tema', 1]">Empezar por el tema 1</a>
            <a class="boton secundario" [routerLink]="['/cursos', c.slug, 'examen']">Ir al examen</a>
          </div>
        }
      } @else {
        <p class="cargando">Cargando…</p>
      }
    </div>
  `,
  styles: `
    .volver { display: inline-block; margin-bottom: 16px; text-decoration: none; font-weight: 600; }
    .lista { list-style: none; padding: 8px; margin: 16px 0 0; }
    .lista li + li { border-top: 1px solid var(--color-borde); }
    .lista a { display: flex; flex-direction: column; padding: 14px 12px; text-decoration: none; color: var(--color-texto); font-weight: 600; }
    .lista a:hover { color: var(--color-primario); }
    .n { font-size: 0.8em; font-weight: 600; color: var(--color-suave); text-transform: uppercase; letter-spacing: 0.04em; }
  `,
})
export class Indice {
  private readonly api = inject(ApiService);
  readonly slug = input.required<string>();

  protected readonly curso = toSignal<Curso | 'error' | undefined>(
    toObservable(this.slug).pipe(
      switchMap((s) => this.api.curso(s).pipe(catchError(() => of('error' as const)))),
    ),
  );
}
