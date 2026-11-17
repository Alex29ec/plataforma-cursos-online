import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, catchError, of, switchMap, take, takeWhile, timer } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { PedidoEstado } from '../../core/modelos';

const INTERVALO_MS = 2000;
const MAX_CONSULTAS = 60;

@Component({
  selector: 'app-pedido',
  imports: [RouterLink],
  templateUrl: './pedido.html',
  styles: `
    .caja { max-width: 600px; margin: 0 auto; text-align: center; }
    .codigo { font-family: ui-monospace, Consolas, monospace; font-size: 1.5em; font-weight: 700; letter-spacing: 0.06em; background: var(--color-primario-claro); border-radius: 8px; padding: 10px 16px; display: inline-block; margin: 8px 0 4px; }
    .centro { justify-content: center; }
    .icono { font-size: 2.4em; margin: 0; }
  `,
})
export class PedidoPagina {
  private readonly api = inject(ApiService);
  readonly pedidoId = input.required<string>();

  /**
   * Consulta el pedido cada 2 s mientras el pago o el diploma estén pendientes.
   * Un fallo de red puntual se ignora (se reintenta en la siguiente consulta); solo un 404 es "no encontrado".
   */
  protected readonly pedido = toSignal<PedidoEstado | 'error' | undefined>(
    toObservable(this.pedidoId).pipe(
      switchMap((id) =>
        timer(0, INTERVALO_MS).pipe(
          take(MAX_CONSULTAS),
          switchMap(() =>
            this.api
              .pedido(id)
              .pipe(
                catchError((e: HttpErrorResponse) => (e.status === 404 ? of('error' as const) : EMPTY)),
              ),
          ),
          takeWhile((p) => p !== 'error' && (p.estado === 'PAGADO' || p.estado === 'PENDIENTE_PAGO'), true),
        ),
      ),
    ),
  );

  protected readonly datos = computed(() => {
    const p = this.pedido();
    return p && p !== 'error' ? p : null;
  });

  protected readonly vista = computed(() => {
    const p = this.pedido();
    return p === 'error' ? 'ERROR' : (p?.estado ?? 'CARGANDO');
  });

  protected recargar(): void {
    window.location.reload();
  }

  protected urlDescarga(p: PedidoEstado): string {
    return this.api.urlDescarga(p.codigoDiploma ?? '', p.tokenDescarga ?? '');
  }
}
