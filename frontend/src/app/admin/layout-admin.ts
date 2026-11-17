import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SesionAdminService } from './sesion-admin.service';

@Component({
  selector: 'app-layout-admin',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="barra">
      <div class="contenedor fila">
        <a routerLink="/admin" class="titulo">Panel · Aula Online</a>
        <div class="usuario">
          @if (sesion.usuario(); as usuario) {
            <span>{{ usuario }}</span>
          }
          <button type="button" class="boton secundario" (click)="salir()">Salir</button>
        </div>
      </div>
    </header>
    <main class="contenedor pagina">
      <router-outlet />
    </main>
  `,
  styles: `
    .barra {
      background: var(--marino);
      color: #fff;
      padding: 12px 0;
    }
    .fila {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px 16px;
    }
    .titulo {
      color: #fff;
      font-weight: 700;
      text-decoration: none;
    }
    .usuario {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  `,
})
export class LayoutAdmin {
  protected readonly sesion = inject(SesionAdminService);
  private readonly router = inject(Router);

  protected salir(): void {
    const aEntrar = () => void this.router.navigateByUrl('/admin/entrar');
    this.sesion.salir().subscribe({
      complete: aEntrar,
      // Si falla (p. ej. sesión ya cerrada en otra pestaña), se olvida el usuario local igualmente.
      error: () => {
        this.sesion.usuario.set(null);
        aEntrar();
      },
    });
  }
}
