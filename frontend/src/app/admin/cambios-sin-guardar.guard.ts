import { CanDeactivateFn } from '@angular/router';

export interface ConCambios {
  tieneCambios(): boolean;
}

export const cambiosSinGuardarGuard: CanDeactivateFn<ConCambios> = (componente) =>
  !componente.tieneCambios() || confirm('Hay cambios sin guardar. ¿Salir igualmente?');
