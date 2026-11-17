import { InjectionToken } from '@angular/core';

/** Datos y textos de la plataforma, en un único sitio. */
export interface Empresa {
  nombre: string;
  web: string;
  telefono: string;
  email: string;
  direccion: string;
  /** Número en formato internacional sin "+" ni espacios (p. ej. 34600000000). Vacío: no se muestra el botón. */
  whatsapp: string;
  /** URL de la página de Facebook. Vacío: no se muestra el icono. */
  facebook: string;
  /** URL de la página de LinkedIn. Vacío: no se muestra el icono. */
  linkedin: string;
  /** Enlace a una ficha con opiniones. Vacío: se muestra el bloque sin enlace. */
  urlOpinionesGoogle: string;
  quienesSomos: string;
}

export const EMPRESA: Empresa = {
  nombre: 'Aula Online',
  web: 'aulaonline.example',
  telefono: '900 000 000',
  email: 'hola@aulaonline.example',
  direccion: 'Calle Ejemplo, 1 · 28000 Madrid',
  whatsapp: '',
  facebook: '',
  linkedin: '',
  urlOpinionesGoogle: '',
  quienesSomos:
    'Aula Online es una plataforma de formación online: cada curso tiene su temario, un examen tipo test ' +
    'y un diploma con código de verificación que se descarga al aprobar. Estudia a tu ritmo, desde ' +
    'cualquier dispositivo.',
};

/** Permite sustituir los datos de la plataforma en los tests. */
export const EMPRESA_DATOS = new InjectionToken<Empresa>('EMPRESA_DATOS', {
  providedIn: 'root',
  factory: () => EMPRESA,
});
