import { InjectionToken } from '@angular/core';

/** Navegación fuera de la app (p. ej. a Stripe). Inyectable para poder simularla en los tests. */
export interface Navegador {
  irA(url: string): void;
}

export const NAVEGADOR = new InjectionToken<Navegador>('NAVEGADOR', {
  providedIn: 'root',
  factory: () => ({ irA: (url: string) => window.location.assign(url) }),
});
