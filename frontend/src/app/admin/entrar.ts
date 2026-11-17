import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AdminApiService } from './admin-api.service';

@Component({
  selector: 'app-entrar',
  imports: [FormsModule],
  template: `
    <section class="contenedor entrar">
      <div class="tarjeta">
        <h1>Acceso al panel</h1>
        <form (submit)="entrar($event)">
          <div class="campo">
            <label for="usuario">Usuario</label>
            <input id="usuario" name="usuario" type="text" autocomplete="username" required [ngModel]="usuario()" (ngModelChange)="usuario.set($event)" />
          </div>
          <div class="campo">
            <label for="password">Contraseña</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required [ngModel]="password()" (ngModelChange)="password.set($event)" />
          </div>
          @if (error()) {
            <p class="aviso error" role="alert">{{ error() }}</p>
          }
          <div class="acciones">
            <button type="submit" class="boton" [disabled]="enviando()">Entrar</button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: `
    .entrar {
      max-width: 420px;
      padding: 56px 0;
    }
  `,
})
export class Entrar {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly usuario = signal('');
  protected readonly password = signal('');
  protected readonly error = signal('');
  protected readonly enviando = signal(false);

  protected entrar(evento: Event): void {
    evento.preventDefault();
    this.error.set('');
    this.enviando.set(true);
    this.api
      .csrf()
      .pipe(switchMap(() => this.api.login(this.usuario(), this.password())))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.destino()),
        error: (e: unknown) => {
          this.enviando.set(false);
          const estado = e instanceof HttpErrorResponse ? e.status : 0;
          const delServidor = e instanceof HttpErrorResponse ? (e.error as { error?: string } | null)?.error : undefined;
          this.error.set(
            estado === 401
              ? 'Usuario o contraseña incorrectos'
              : estado === 429
                ? 'Demasiados intentos. Espera 15 minutos.'
                : (delServidor ?? 'No se pudo iniciar sesión. Inténtalo de nuevo.'),
          );
        },
      });
  }

  /** Solo se acepta una ruta interna (evita redirecciones abiertas). */
  private destino(): string {
    const volver = this.ruta.snapshot.queryParamMap.get('volver');
    return volver && volver.startsWith('/') && !volver.startsWith('//') ? volver : '/admin';
  }
}
