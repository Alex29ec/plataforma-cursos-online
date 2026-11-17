import { Component, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AlmacenLocalService } from '../../core/almacen-local.service';
import { Curso, formatearPrecio } from '../../core/modelos';

/** Página de un curso (antes la portada de la web de un solo curso), ahora por slug. */
@Component({
  selector: 'app-curso',
  imports: [RouterLink],
  templateUrl: './curso.html',
  styleUrl: './curso.scss',
})
export class CursoPagina {
  private readonly api = inject(ApiService);
  readonly slug = input.required<string>();

  protected readonly curso = toSignal<Curso | 'error' | undefined>(
    toObservable(this.slug).pipe(
      switchMap((s) => this.api.curso(s).pipe(catchError(() => of('error' as const)))),
    ),
  );
  protected readonly precio = formatearPrecio;

  private readonly almacen = inject(AlmacenLocalService);
  /** Recordatorio si en este navegador hay un diploma pagado o un examen aprobado sin pagar. */
  protected readonly pedidoGuardado = this.almacen.pedido();
  protected readonly intentoGuardado = this.almacen.intentoAprobado();

  constructor() {
    const title = inject(Title);
    effect(() => {
      const c = this.curso();
      if (c && c !== 'error') {
        title.setTitle(`${c.titulo} | Aula Online`);
      } else if (c === 'error') {
        title.setTitle('Curso no disponible | Aula Online');
      }
    });
  }
}
