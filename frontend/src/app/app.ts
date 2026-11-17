import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { EMPRESA_DATOS } from './core/empresa';
import { ENTORNO } from './core/entorno';
import { reiniciarDemo } from './demo/demo.interceptor';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly demo = ENTORNO.demo;
  protected readonly anio = new Date().getFullYear();
  protected readonly empresa = inject(EMPRESA_DATOS);
  protected readonly urlWhatsapp = this.empresa.whatsapp ? `https://wa.me/${this.empresa.whatsapp}` : null;
  private readonly router = inject(Router);
  /** En /admin se oculta la cabecera, el pie y el botón de WhatsApp públicos. */
  protected readonly enAdmin = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => /^\/admin(\/|\?|#|$)/.test(e.urlAfterRedirects)),
    ),
    { initialValue: /^\/admin(\/|\?|#|$)/.test(location.pathname) },
  );

  /** Borra los datos de la demo guardados en este navegador y vuelve a los de ejemplo. */
  protected reiniciar(): void {
    if (!confirm('¿Borrar todos los datos de la demo y empezar de cero?')) return;
    reiniciarDemo();
    location.href = document.baseURI;
  }
}
