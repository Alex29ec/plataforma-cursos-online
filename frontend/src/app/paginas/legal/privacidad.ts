import { Component } from '@angular/core';

@Component({
  selector: 'app-privacidad',
  template: `
    <div class="contenedor pagina legal">
      <p class="aviso">PROVISIONAL – pendiente de los datos del titular de la web.</p>
      <h1>Política de privacidad</h1>

      <h2>Responsable del tratamiento</h2>
      <p>[Nombre o razón social] · [CIF/NIF] · [Dirección] · [Email de contacto].</p>

      <h2>Qué datos tratamos y para qué</h2>
      <p>
        Cuando solicitas un diploma tratamos tu nombre, apellidos, DNI/NIE y email con la única finalidad de emitir el
        diploma, permitir su verificación y gestionar el pago. Las respuestas del examen se usan solo para calcular tu nota.
      </p>

      <h2>Base legal</h2>
      <p>La ejecución del servicio que solicitas (emisión del diploma) y tu consentimiento.</p>

      <h2>Conservación</h2>
      <p>Conservaremos los datos del diploma mientras sea necesario para su verificación y durante los plazos legales aplicables.</p>

      <h2>Destinatarios</h2>
      <p>
        El proveedor de pagos (Stripe) recibe los datos necesarios para procesar el cobro. En la página pública de
        verificación solo se muestran tu nombre, el curso, la fecha y tu DNI/NIE parcialmente oculto.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo
        a [email de contacto]. También puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).
      </p>
    </div>
  `,
  styles: `.legal { max-width: 760px; } .legal h2 { font-size: 1.15em; margin-top: 1.6em; }`,
})
export class Privacidad {}
