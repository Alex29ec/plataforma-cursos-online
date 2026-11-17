import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

/** Sustituye a Stripe en la demo: no cobra nada. */
@Component({
  selector: 'app-pago-simulado',
  template: `
    <div class="contenedor pagina">
      <div class="tarjeta caja">
        <p class="demo">MODO DEMO – no se cobra nada</p>
        <h1>Pasarela de pago simulada</h1>
        <p class="suave">En la web real aquí aparecería la página de pago segura de Stripe.</p>
        @if (error()) {
          <div class="aviso error">No se ha podido confirmar el pago. Inténtalo de nuevo.</div>
        }
        <div class="acciones centro">
          <button class="boton" type="button" [disabled]="enviando()" (click)="pagar()">Simular pago</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .caja { max-width: 520px; margin: 0 auto; text-align: center; }
    .demo { display: inline-block; background: var(--color-aviso-claro); color: var(--color-acento); font-weight: 700; border-radius: 999px; padding: 4px 12px; font-size: 0.85em; }
    .centro { justify-content: center; }
  `,
})
export class PagoSimulado {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly pedidoId = input.required<string>();
  protected readonly enviando = signal(false);
  protected readonly error = signal(false);

  pagar(): void {
    this.enviando.set(true);
    this.error.set(false);
    this.api.confirmarPagoSimulado(this.pedidoId()).subscribe({
      next: () => this.router.navigate(['/pedido', this.pedidoId()]),
      error: () => {
        this.enviando.set(false);
        this.error.set(true);
      },
    });
  }
}
