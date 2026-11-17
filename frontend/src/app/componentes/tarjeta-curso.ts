import { Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CursoCatalogo, formatearPrecio } from '../core/modelos';

/**
 * Tarjeta de un curso del catálogo. Los publicados son un enlace a su página;
 * los "Próximamente" llevan el sello y no se pueden abrir.
 */
@Component({
  selector: 'app-tarjeta-curso',
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    @if (publicado()) {
      <a class="tarjeta-curso" [routerLink]="['/cursos', curso().slug]">
        <ng-container [ngTemplateOutlet]="contenido" />
      </a>
    } @else {
      <div class="tarjeta-curso proximamente">
        <ng-container [ngTemplateOutlet]="contenido" />
      </div>
    }

    <ng-template #contenido>
      <div class="foto">
        @if (curso().imagenUrl; as url) {
          <img [src]="url" [alt]="'Imagen del curso ' + curso().titulo" loading="lazy" />
        } @else {
          <span class="foto-titulo" aria-hidden="true">{{ curso().titulo }}</span>
        }
        @if (!publicado()) {
          <span class="sello-proximamente">Próximamente</span>
        }
      </div>
      <div class="cuerpo">
        <h3>{{ curso().titulo }}</h3>
        <p class="resumen">{{ curso().resumen }}</p>
        <p class="datos">
          <span>{{ curso().horas }} h</span>
          <strong>{{ precio() }}</strong>
        </p>
      </div>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .tarjeta-curso {
      display: flex; flex-direction: column; height: 100%;
      background: #fff; border: 1px solid var(--color-borde); border-radius: var(--radio);
      box-shadow: var(--sombra); overflow: hidden; color: var(--color-texto); text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    a.tarjeta-curso:hover, a.tarjeta-curso:focus-visible { transform: translateY(-3px); box-shadow: 0 10px 28px rgb(15 27 45 / 0.14); }
    a.tarjeta-curso:hover h3 { color: var(--color-primario); }
    .proximamente { cursor: default; }
    .proximamente .foto img, .proximamente .foto-titulo { opacity: 0.75; }
    .foto {
      position: relative; aspect-ratio: 16 / 9; display: grid; place-items: center;
      background: linear-gradient(135deg, var(--turquesa), var(--marino));
    }
    .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .foto-titulo { color: #fff; font-weight: 600; font-size: 1.15rem; text-align: center; padding: 16px; line-height: 1.25; }
    .sello-proximamente {
      position: absolute; top: 12px; right: 12px; background: var(--color-primario); color: #fff;
      font-weight: 600; font-size: 0.8rem; padding: 4px 12px; border-radius: 999px;
    }
    .cuerpo { display: flex; flex-direction: column; flex: 1; padding: 16px 18px 18px; }
    h3 { font-size: 1.1rem; margin-bottom: 6px; }
    .resumen { color: var(--color-suave); font-size: 0.93rem; margin: 0 0 14px; flex: 1; }
    .datos { display: flex; justify-content: space-between; align-items: center; margin: 0; }
    .datos span { color: var(--color-suave); font-size: 0.9rem; }
    .datos strong { color: var(--marino); font-size: 1.15rem; }
  `,
})
export class TarjetaCurso {
  readonly curso = input.required<CursoCatalogo>();
  protected readonly publicado = computed(() => this.curso().estado === 'PUBLICADO');
  protected readonly precio = computed(() => formatearPrecio(this.curso().precioCentimos));
}
