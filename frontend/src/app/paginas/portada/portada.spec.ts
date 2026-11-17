import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { EMPRESA } from '../../core/empresa';
import { CursoCatalogo } from '../../core/modelos';
import { Portada } from './portada';

const A: CursoCatalogo = {
  slug: 'a',
  titulo: 'Curso A',
  resumen: 'Resumen A',
  horas: 10,
  precioCentimos: 1990,
  estado: 'PUBLICADO',
  imagenUrl: null,
};
const B: CursoCatalogo = {
  slug: 'b',
  titulo: 'Curso B',
  resumen: 'Resumen B',
  horas: 20,
  precioCentimos: 2990,
  estado: 'PROXIMAMENTE',
  imagenUrl: '/api/imagenes/b.jpg',
};

describe('Portada', () => {
  async function montar(catalogo: CursoCatalogo[]) {
    TestBed.configureTestingModule({
      imports: [Portada],
      providers: [provideRouter([]), { provide: ApiService, useValue: { catalogo: () => of(catalogo) } }],
    });
    const fixture = TestBed.createComponent(Portada);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const texto = (el: Element) => (el.textContent ?? '').replace(/ /g, ' ');

  it('muestra el catálogo: los publicados enlazados y los próximos sin enlace', async () => {
    const el = await montar([A, B]);
    const catalogo = el.querySelector('#cursos')!;
    const tarjetas = catalogo.querySelectorAll('.tarjeta-curso');
    expect(tarjetas.length).toBe(2);

    const enlaceA = catalogo.querySelector<HTMLAnchorElement>('a[href="/cursos/a"]');
    expect(enlaceA).not.toBeNull();
    expect(texto(enlaceA!)).toContain('Curso A');
    expect(texto(enlaceA!)).toContain('19,90 €');

    const tarjetaB = tarjetas[1];
    expect(texto(tarjetaB)).toContain('Curso B');
    expect(texto(tarjetaB)).toContain('Próximamente');
    expect(tarjetaB.closest('a')).toBeNull();
    expect(tarjetaB.querySelector('a')).toBeNull();
    expect(catalogo.querySelector('a[href="/cursos/b"]')).toBeNull();
    expect(tarjetaB.querySelector('img')?.getAttribute('alt')).toBeTruthy();
  });

  it('tiene la sección de contacto con el teléfono de la empresa', async () => {
    const el = await montar([A]);
    const contacto = el.querySelector('#contacto');
    expect(contacto).not.toBeNull();
    expect(texto(contacto!)).toContain(EMPRESA.telefono);
    expect(texto(contacto!)).toContain(EMPRESA.email);
  });

  it('la portada tiene un titular visible y el sello 100 % online', async () => {
    const el = await montar([A]);
    const h1 = el.querySelector('.portada h1');
    expect(texto(h1!)).toContain('Fórmate online');
    expect(h1!.classList.contains('solo-lectores')).toBe(false);
    expect(el.querySelector('.portada .sello-redondo')).not.toBeNull();
  });

  it('la portada tiene los botones al curso y al catálogo', async () => {
    const el = await montar([A]);
    const portada = el.querySelector('.portada')!;
    const quiero = [...portada.querySelectorAll('a')].find((a) => texto(a).includes('Quiero mi curso'));
    expect(quiero?.getAttribute('href')).toBe('/cursos/manipulador-alimentos');
    const todos = [...portada.querySelectorAll('a')].find((a) => texto(a).includes('Ver todos los cursos'));
    expect(todos?.getAttribute('href')).toBe('/#cursos');
  });

  it('tiene el bloque destacado con foto y enlace al curso', async () => {
    const el = await montar([A]);
    const destacado = el.querySelector('section.destacado')!;
    const img = destacado.querySelector('img[src="img/destacado-manipulador.jpg"]');
    expect(img?.getAttribute('alt')).toBeTruthy();
    const enlace = destacado.querySelector('a[href="/cursos/manipulador-alimentos"]');
    expect(texto(enlace!)).toContain('Quiero mi curso');
  });

  it('con el catálogo vacío avisa de que habrá cursos pronto', async () => {
    const el = await montar([]);
    expect(texto(el.querySelector('#cursos')!)).toContain('Muy pronto nuevos cursos');
    expect(el.querySelectorAll('.tarjeta-curso').length).toBe(0);
  });
});
