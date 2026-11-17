import { Injectable } from '@angular/core';

const CLAVE_INTENTO = 'curso.intentoAprobado';
const CLAVE_PEDIDO = 'curso.pedido';

/**
 * Recuerda en el navegador el último examen aprobado y el último pedido, para que el alumno
 * pueda volver a ellos si cierra la pestaña. Si localStorage no está disponible, no hace nada.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenLocalService {
  guardarIntentoAprobado(id: string): void {
    escribir(CLAVE_INTENTO, id);
  }

  intentoAprobado(): string | null {
    return leer(CLAVE_INTENTO);
  }

  guardarPedido(id: string): void {
    escribir(CLAVE_PEDIDO, id);
  }

  pedido(): string | null {
    return leer(CLAVE_PEDIDO);
  }

  limpiar(): void {
    try {
      localStorage.removeItem(CLAVE_INTENTO);
      localStorage.removeItem(CLAVE_PEDIDO);
    } catch {
      // sin almacenamiento: nada que borrar
    }
  }
}

function escribir(clave: string, valor: string): void {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // modo privado o almacenamiento bloqueado
  }
}

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}
