import { Component, ViewEncapsulation, computed, inject, input, numberAttribute } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { marked } from 'marked';
import { ApiService } from '../../core/api.service';
import { Tema } from '../../core/modelos';

@Component({
  selector: 'app-tema',
  imports: [RouterLink],
  template: `
    <div class="contenedor pagina">
      <a [routerLink]="['/cursos', slug(), 'temario']" class="volver">← Temario</a>
      @if (tema(); as t) {
        @if (t === 'error') {
          <div class="aviso error">No se ha encontrado este tema.</div>
        } @else {
          <p class="n">Tema {{ t.orden }} de {{ total() }}</p>
          <h1>{{ t.titulo }}</h1>
          <article class="tarjeta contenido" [innerHTML]="html()"></article>
          <nav class="acciones navegacion">
            @if (t.orden > 1) {
              <a class="boton secundario" [routerLink]="['/cursos', slug(), 'tema', t.orden - 1]">← Anterior</a>
            }
            @if (t.orden < total()) {
              <a class="boton" [routerLink]="['/cursos', slug(), 'tema', t.orden + 1]">Siguiente →</a>
            } @else {
              <a class="boton" [routerLink]="['/cursos', slug(), 'examen']">Hacer el examen</a>
            }
          </nav>
        }
      } @else {
        <p class="cargando">Cargando…</p>
      }
    </div>
  `,
  // Sin encapsulación: el HTML del tema se inserta con innerHTML y los estilos encapsulados no le llegarían.
  encapsulation: ViewEncapsulation.None,
  styles: `
    app-tema .volver { display: inline-block; margin-bottom: 16px; text-decoration: none; font-weight: 600; }
    app-tema .n { margin: 0 0 4px; font-size: 0.85em; font-weight: 600; color: var(--color-suave); text-transform: uppercase; letter-spacing: 0.04em; }
    app-tema .contenido { font-size: 1.05em; }
    app-tema .contenido :is(h2, h3) { margin-top: 1.4em; }
    app-tema .contenido > :first-child { margin-top: 0; }
    app-tema .contenido blockquote { margin: 0 0 1em; padding: 10px 14px; background: var(--color-aviso-claro); border-left: 4px solid var(--color-acento); border-radius: 6px; }
    app-tema .contenido blockquote p { margin: 0; }
    app-tema .contenido li { margin-bottom: 4px; }
    app-tema .navegacion { justify-content: space-between; }
  `,
})
export class TemaPagina {
  private readonly api = inject(ApiService);
  readonly slug = input.required<string>();
  readonly orden = input.required({ transform: numberAttribute });

  private readonly curso = toSignal(
    toObservable(this.slug).pipe(switchMap((s) => this.api.curso(s).pipe(catchError(() => of(undefined))))),
  );
  protected readonly total = computed(() => this.curso()?.temas.length ?? 0);

  protected readonly tema = toSignal<Tema | 'error' | undefined>(
    toObservable(computed(() => ({ slug: this.slug(), orden: this.orden() }))).pipe(
      switchMap(({ slug, orden }) => this.api.tema(slug, orden).pipe(catchError(() => of('error' as const)))),
    ),
  );

  protected readonly html = computed(() => {
    const t = this.tema();
    return t && t !== 'error' ? (marked.parse(t.contenido, { async: false }) as string) : '';
  });
}
