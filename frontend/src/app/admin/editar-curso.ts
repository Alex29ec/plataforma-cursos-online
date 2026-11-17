import { Component, inject, input, linkedSignal, numberAttribute, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { AdminApiService } from './admin-api.service';
import { ConCambios } from './cambios-sin-guardar.guard';
import { DatosCurso } from './datos-curso';
import { CursoAdmin } from './modelos-admin';
import { PreguntasCurso } from './preguntas-curso';
import { TemasCurso } from './temas-curso';

type Pestana = 'datos' | 'temas' | 'preguntas';

@Component({
  selector: 'app-editar-curso',
  imports: [RouterLink, DatosCurso, TemasCurso, PreguntasCurso],
  template: `
    <a routerLink="/admin" class="volver">← Cursos</a>
    @if (curso(); as c) {
      <div class="cabecera">
        <h1>{{ c.titulo }}</h1>
        @if (c.estado === 'PUBLICADO') {
          <a [routerLink]="['/cursos', c.slug]">Ver en la web</a>
        }
      </div>

      <div class="pestanas" role="tablist">
        @for (p of pestanas; track p.id) {
          <button type="button" role="tab" class="pestana" [id]="'pestana-' + p.id" [attr.aria-selected]="activa() === p.id" [attr.aria-controls]="'panel-' + p.id" (click)="activa.set(p.id)">
            {{ p.etiqueta }}
          </button>
        }
      </div>

      <div role="tabpanel" id="panel-datos" aria-labelledby="pestana-datos" [hidden]="activa() !== 'datos'">
        <app-datos-curso [curso]="c" (cursoCambiado)="curso.set($event)" />
      </div>
      <div role="tabpanel" id="panel-temas" aria-labelledby="pestana-temas" [hidden]="activa() !== 'temas'">
        <app-temas-curso [cursoId]="c.id" />
      </div>
      <div role="tabpanel" id="panel-preguntas" aria-labelledby="pestana-preguntas" [hidden]="activa() !== 'preguntas'">
        <app-preguntas-curso [cursoId]="c.id" [numPreguntas]="c.numPreguntas" />
      </div>
    } @else if (error()) {
      <p class="aviso error" role="alert">No se pudo cargar el curso.</p>
    } @else {
      <p class="cargando">Cargando…</p>
    }
  `,
  styles: `
    .volver { display: inline-block; margin-bottom: 12px; text-decoration: none; font-weight: 600; }
    .cabecera { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .pestanas { display: flex; gap: 6px; margin: 12px 0 16px; border-bottom: 1px solid var(--color-borde); }
    .pestana { padding: 8px 16px; border: 0; border-bottom: 3px solid transparent; background: transparent; font: inherit; cursor: pointer; }
    .pestana[aria-selected='true'] { border-bottom-color: currentColor; font-weight: 700; }
  `,
})
export class EditarCurso implements ConCambios {
  private readonly api = inject(AdminApiService);

  readonly id = input.required({ transform: numberAttribute });

  protected readonly pestanas: { id: Pestana; etiqueta: string }[] = [
    { id: 'datos', etiqueta: 'Datos' },
    { id: 'temas', etiqueta: 'Temas' },
    { id: 'preguntas', etiqueta: 'Preguntas' },
  ];
  protected readonly activa = signal<Pestana>('datos');
  protected readonly error = signal(false);

  private readonly datos = viewChild(DatosCurso);
  private readonly temas = viewChild(TemasCurso);
  private readonly preguntas = viewChild(PreguntasCurso);

  // Se pide el token CSRF antes de cargar: así la cookie XSRF-TOKEN existe aunque se recargue la página.
  private readonly cargado = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        this.api.csrf().pipe(
          switchMap(() => this.api.curso(id)),
          catchError(() => {
            this.error.set(true);
            return of(null);
          }),
        ),
      ),
    ),
  );
  protected readonly curso = linkedSignal<CursoAdmin | null>(() => this.cargado() ?? null);

  tieneCambios(): boolean {
    return !!(this.datos()?.tieneCambios() || this.temas()?.tieneCambios() || this.preguntas()?.tieneCambios());
  }
}
