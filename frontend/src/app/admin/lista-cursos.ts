import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { formatearPrecio } from '../core/modelos';
import { AdminApiService } from './admin-api.service';
import { CursoAdminResumen, ETIQUETA_ESTADO } from './modelos-admin';

@Component({
  selector: 'app-lista-cursos',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="cabecera-lista">
      <h1>Cursos</h1>
      @if (!creando()) {
        <button type="button" class="boton nuevo" (click)="creando.set(true)">Nuevo curso</button>
      }
    </div>

    @if (creando()) {
      <form class="tarjeta nuevo-curso" (submit)="crear($event)">
        <div class="campo">
          <label for="titulo-nuevo">Título del curso</label>
          <input id="titulo-nuevo" name="titulo" type="text" maxlength="200" required [ngModel]="titulo()" (ngModelChange)="titulo.set($event)" />
        </div>
        @if (errorCrear()) {
          <p class="aviso error" role="alert">{{ errorCrear() }}</p>
        }
        <div class="acciones">
          <button type="submit" class="boton" [disabled]="guardando()">Crear</button>
          <button type="button" class="boton secundario" (click)="creando.set(false)">Cancelar</button>
        </div>
      </form>
    }

    @if (cursos(); as lista) {
      @if (lista.length === 0) {
        <p class="suave">Todavía no hay cursos.</p>
      } @else {
        <div class="tabla-envoltorio">
          <table>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Temas</th>
                <th>Preguntas</th>
                <th>Precio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (c of lista; track c.id) {
                <tr>
                  <td>
                    @if (c.imagenUrl) {
                      <img [src]="c.imagenUrl" alt="" width="64" height="40" />
                    }
                  </td>
                  <td>
                    <a [routerLink]="['/admin/cursos', c.id]">{{ c.titulo }}</a>
                  </td>
                  <td>{{ etiqueta(c) }}</td>
                  <td>{{ c.temas }}</td>
                  <td>{{ c.preguntasActivas }}</td>
                  <td>{{ precio(c.precioCentimos) }}</td>
                  <td>
                    @if (c.estado === 'PUBLICADO') {
                      <a [routerLink]="['/cursos', c.slug]">Ver en la web</a>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    } @else if (error()) {
      <p class="aviso error" role="alert">No se pudieron cargar los cursos.</p>
    } @else {
      <p class="cargando">Cargando…</p>
    }
  `,
  styles: `
    .cabecera-lista {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }
    .nuevo-curso {
      margin-bottom: 20px;
    }
    .tabla-envoltorio {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid var(--color-borde);
      vertical-align: middle;
    }
    img {
      object-fit: cover;
      border-radius: 6px;
    }
  `,
})
export class ListaCursos {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);

  protected readonly cursos = signal<CursoAdminResumen[] | null>(null);
  protected readonly error = signal(false);
  protected readonly creando = signal(false);
  protected readonly titulo = signal('');
  protected readonly errorCrear = signal('');
  protected readonly guardando = signal(false);

  constructor() {
    this.api.cursos().subscribe({
      next: (c) => this.cursos.set(c),
      error: () => this.error.set(true),
    });
  }

  protected etiqueta(c: CursoAdminResumen): string {
    return ETIQUETA_ESTADO[c.estado];
  }

  protected precio(centimos: number): string {
    return formatearPrecio(centimos);
  }

  protected crear(evento: Event): void {
    evento.preventDefault();
    const titulo = this.titulo().trim();
    if (!titulo) {
      this.errorCrear.set('Escribe un título.');
      return;
    }
    this.errorCrear.set('');
    this.guardando.set(true);
    this.api.crearCurso(titulo).subscribe({
      next: (c) => void this.router.navigateByUrl(`/admin/cursos/${c.id}`),
      error: () => {
        this.guardando.set(false);
        this.errorCrear.set('No se pudo crear el curso.');
      },
    });
  }
}
