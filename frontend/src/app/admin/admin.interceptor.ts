import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { SesionAdminService } from './sesion-admin.service';

/** Peticiones de admin cuyo 401 es esperado (no implica sesión caducada). */
const EXENTAS = ['/api/admin/login', '/api/admin/yo', '/api/admin/csrf'];

/**
 * Un 401 en /api/admin/** (sesión caducada) lleva a la pantalla de acceso. Un 403 puede ser lo mismo:
 * al cerrar sesión en otra pestaña se borra la cookie XSRF y Spring rechaza por CSRF antes de mirar la
 * sesión. En ese caso se pregunta a /yo y, si responde 401, también se va a la pantalla de acceso.
 */
export const adminInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const sesion = inject(SesionAdminService);
  const http = inject(HttpClient);
  const aEntrar = () => {
    sesion.usuario.set(null);
    void router.navigate(['/admin/entrar'], { queryParams: { volver: router.url } });
  };
  return next(req).pipe(
    tap({
      error: (e) => {
        if (
          !(e instanceof HttpErrorResponse) ||
          !req.url.startsWith('/api/admin/') ||
          EXENTAS.some((u) => req.url.startsWith(u))
        ) {
          return;
        }
        if (e.status === 401) {
          aEntrar();
        } else if (e.status === 403) {
          http.get('/api/admin/yo').subscribe({
            error: (yo) => {
              if (yo instanceof HttpErrorResponse && yo.status === 401) aEntrar();
            },
          });
        }
      },
    }),
  );
};
