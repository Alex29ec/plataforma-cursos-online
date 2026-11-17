import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { EMPRESA, EMPRESA_DATOS, Empresa } from './core/empresa';

@Component({ template: '' })
class Vacia {}

describe('App (cabecera, pie y WhatsApp)', () => {
  async function montar(datos: Partial<Empresa> = {}) {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: Vacia },
          { path: 'admin', component: Vacia },
        ]),
        { provide: EMPRESA_DATOS, useValue: { ...EMPRESA, ...datos } },
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture;
  }

  it('la cabecera muestra la marca dentro del enlace al inicio', async () => {
    const el: HTMLElement = (await montar()).nativeElement;
    const marca = el.querySelector('header a[href="/"]');
    expect(marca?.getAttribute('aria-label')).toContain('Aula Online');
    expect(marca?.textContent).toContain('AulaOnline');
  });

  it('el pie muestra la dirección y el teléfono', async () => {
    const el: HTMLElement = (await montar()).nativeElement;
    const pie = el.querySelector('footer')!.textContent!.replace(/ /g, ' ');
    expect(pie).toContain(EMPRESA.direccion);
    expect(pie).toContain(EMPRESA.telefono);
  });

  it('sin WhatsApp ni redes no hay botones', async () => {
    const el: HTMLElement = (await montar()).nativeElement;
    expect(el.querySelector('a[href^="https://wa.me"]')).toBeNull();
    expect(el.querySelector('a[href*="facebook"]')).toBeNull();
    expect(el.querySelector('a[href*="linkedin"]')).toBeNull();
  });

  it('con WhatsApp y redes aparecen el botón flotante y los iconos', async () => {
    const el: HTMLElement = (
      await montar({ whatsapp: '34600000000', facebook: 'https://facebook.com/x', linkedin: 'https://linkedin.com/x' })
    ).nativeElement;
    const wa = el.querySelector('a[href="https://wa.me/34600000000"]');
    expect(wa?.getAttribute('aria-label')).toBe('Escríbenos por WhatsApp');
    expect(el.querySelector('footer a[href="https://facebook.com/x"]')?.getAttribute('aria-label')).toBeTruthy();
    expect(el.querySelector('footer a[href="https://linkedin.com/x"]')?.getAttribute('aria-label')).toBeTruthy();
  });

  it('fuera de la demo no aparece el aviso de versión de demostración', async () => {
    const el: HTMLElement = (await montar()).nativeElement;
    expect(el.querySelector('.aviso-demo')).toBeNull();
  });

  it('en el panel no aparece el botón de WhatsApp', async () => {
    const fixture = await montar({ whatsapp: '34600000000' });
    await TestBed.inject(Router).navigateByUrl('/admin');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('a[href^="https://wa.me"]')).toBeNull();
  });
});
