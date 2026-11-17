import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AdminApiService } from './admin-api.service';

@Injectable({ providedIn: 'root' })
export class SesionAdminService {
  private readonly api = inject(AdminApiService);
  readonly usuario = signal<string | null>(null);

  /** true si hay sesión de administrador (consulta /yo si aún no se conoce). */
  comprobar(): Observable<boolean> {
    if (this.usuario() !== null) return of(true);
    return this.api.yo().pipe(
      tap((r) => this.usuario.set(r.usuario)),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  salir(): Observable<void> {
    return this.api.logout().pipe(tap(() => this.usuario.set(null)));
  }
}
