import { HttpErrorResponse } from '@angular/common/http';

/** Mensaje del backend (`{error}`) o uno genérico. */
export function mensajeError(e: unknown, porDefecto: string): string {
  if (e instanceof HttpErrorResponse && typeof e.error?.error === 'string' && e.error.error) {
    return e.error.error;
  }
  return porDefecto;
}

/** Errores por campo de un 400 (`{campos:{campo: mensaje}}`). */
export function camposError(e: unknown): Record<string, string> {
  if (e instanceof HttpErrorResponse && e.status === 400 && e.error?.campos && typeof e.error.campos === 'object') {
    return e.error.campos as Record<string, string>;
  }
  return {};
}
