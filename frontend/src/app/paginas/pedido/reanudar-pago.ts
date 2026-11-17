import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AlmacenLocalService } from '../../core/almacen-local.service';

/**
 * Vuelta desde la pasarela sin pagar (cancel_url de Stripe) o botón "Ir a pagar":
 * reabre el formulario del último examen aprobado en este navegador.
 */
@Component({
  selector: 'app-reanudar-pago',
  imports: [RouterLink],
  template: `
    <div class="contenedor pagina">
      <div class="tarjeta" style="max-width: 560px; margin: 0 auto; text-align: center">
        <h1>No hemos encontrado tu examen</h1>
        <p class="suave">
          Este navegador no recuerda tu examen aprobado. Vuelve a hacer el examen del curso para obtener el diploma.
        </p>
        <div class="acciones" style="justify-content: center"><a class="boton" routerLink="/" fragment="cursos">Ver los cursos</a></div>
      </div>
    </div>
  `,
})
export class ReanudarPago {
  constructor() {
    const intento = inject(AlmacenLocalService).intentoAprobado();
    if (intento) {
      inject(Router).navigate(['/intento', intento, 'datos'], { replaceUrl: true });
    }
  }
}
