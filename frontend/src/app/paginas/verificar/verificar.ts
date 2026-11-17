import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Verificacion } from '../../core/modelos';

@Component({
  selector: 'app-verificar',
  imports: [FormsModule],
  template: `
    <div class="contenedor pagina">
      <div class="caja">
        <h1>Verificar un diploma</h1>
        <p class="suave">Introduce el código que aparece en el diploma (por ejemplo, CO-7K3P-Q9XD).</p>

        <form class="buscador" (ngSubmit)="buscar()">
          <div class="campo">
            <label for="codigo">Código del diploma</label>
            <input id="codigo" name="codigo" type="text" [(ngModel)]="texto" autocomplete="off" placeholder="CO-XXXX-XXXX" />
          </div>
          <button class="boton" type="submit" [disabled]="buscando()">Verificar</button>
        </form>

        @if (error()) {
          <div class="aviso error">No se ha podido hacer la consulta. Inténtalo de nuevo.</div>
        }

        @if (resultado(); as r) {
          @if (r.valido) {
            <div class="tarjeta valido">
              <p class="sello">✓ Diploma válido</p>
              <dl>
                <dt>Código</dt><dd>{{ r.codigo }}</dd>
                <dt>Titular</dt><dd>{{ r.titular }}</dd>
                <dt>DNI/NIE</dt><dd>{{ r.dniEnmascarado }}</dd>
                <dt>Curso</dt><dd>{{ r.curso }}</dd>
                <dt>Duración</dt><dd>{{ r.horas }} horas</dd>
                <dt>Fecha de emisión</dt><dd>{{ fecha(r.fechaEmision) }}</dd>
              </dl>
            </div>
          } @else {
            <div class="aviso error">No se ha encontrado ningún diploma con ese código.</div>
          }
        }
      </div>
    </div>
  `,
  styles: `
    .caja { max-width: 620px; margin: 0 auto; }
    .buscador { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px; margin-bottom: 20px; }
    .buscador .campo { flex: 1 1 240px; margin: 0; }
    .buscador input { text-transform: uppercase; }
    .valido { border-top: 6px solid var(--color-ok); }
    .sello { color: var(--color-ok); font-weight: 800; font-size: 1.2em; margin: 0 0 12px; }
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 8px 16px; margin: 0; }
    dt { color: var(--color-suave); }
    dd { margin: 0; font-weight: 600; }
  `,
})
export class VerificarPagina {
  private readonly api = inject(ApiService);
  readonly codigo = input<string>();

  protected texto = '';
  protected readonly resultado = signal<Verificacion | null>(null);
  protected readonly buscando = signal(false);
  protected readonly error = signal(false);

  constructor() {
    effect(() => {
      const c = this.codigo();
      if (c) {
        this.texto = c;
        this.consultar(c);
      }
    });
  }

  buscar(): void {
    const c = this.texto.trim();
    if (c) {
      this.consultar(c);
    }
  }

  protected fecha(iso?: string): string {
    if (!iso) return '';
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
  }

  private consultar(codigo: string): void {
    this.buscando.set(true);
    this.error.set(false);
    this.api.verificar(codigo).subscribe({
      next: (r) => {
        this.resultado.set(r);
        this.buscando.set(false);
      },
      error: () => {
        this.resultado.set(null);
        this.error.set(true);
        this.buscando.set(false);
      },
    });
  }
}
