import { Component } from '@angular/core';

@Component({
  selector: 'app-aviso-legal',
  template: `
    <div class="contenedor pagina legal">
      <p class="aviso">PROVISIONAL – pendiente de los datos del titular de la web.</p>
      <h1>Aviso legal</h1>

      <h2>Titular</h2>
      <p>[Nombre o razón social] · [CIF/NIF] · [Domicilio] · [Email] · [Datos registrales, si los hay].</p>

      <h2>Objeto</h2>
      <p>
        Esta web ofrece cursos de formación online y la emisión de un diploma acreditativo para quienes superen el
        examen de cada curso.
      </p>

      <h2>Condiciones de compra</h2>
      <p>
        El acceso al temario y al examen de cada curso es gratuito. El diploma de cada curso tiene un precio que se
        indica antes del pago. Solo se puede comprar tras aprobar el examen de ese curso. [Condiciones de
        desistimiento y devoluciones pendientes de definir].
      </p>

      <h2>Propiedad intelectual</h2>
      <p>Los contenidos de los cursos pertenecen a su titular y no pueden reproducirse sin autorización.</p>
    </div>
  `,
  styles: `.legal { max-width: 760px; } .legal h2 { font-size: 1.15em; margin-top: 1.6em; }`,
})
export class AvisoLegal {}
