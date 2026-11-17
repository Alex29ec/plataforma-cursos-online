import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminApiService } from './admin-api.service';
import { CursoAdminResumen } from './modelos-admin';
import { ListaCursos } from './lista-cursos';

const fila = (o: Partial<CursoAdminResumen>): CursoAdminResumen => ({
  id: 1,
  slug: 'a',
  titulo: 'Curso A',
  estado: 'PUBLICADO',
  temas: 4,
  preguntasActivas: 30,
  precioCentimos: 1990,
  imagenUrl: null,
  ...o,
});

describe('ListaCursos', () => {
  async function montar(filas: CursoAdminResumen[], api: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({
      imports: [ListaCursos],
      providers: [provideRouter([]), { provide: AdminApiService, useValue: { cursos: () => of(filas), ...api } }],
    });
    const fixture = TestBed.createComponent(ListaCursos);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }
  const texto = (el: Element) => (el.textContent ?? '').replace(/ /g, ' ');

  it('pinta filas con estado traducido, contadores y precio', async () => {
    const { el } = await montar([
      fila({}),
      fila({ id: 2, slug: 'b', titulo: 'Curso B', estado: 'BORRADOR', temas: 0, preguntasActivas: 0 }),
      fila({ id: 3, slug: 'c', titulo: 'Curso C', estado: 'PROXIMAMENTE' }),
    ]);
    const filas = el.querySelectorAll('tbody tr');
    expect(filas.length).toBe(3);
    expect(texto(filas[0])).toContain('Publicado');
    expect(texto(filas[0])).toContain('19,90 €');
    expect(texto(filas[0])).toContain('30');
    expect(texto(filas[1])).toContain('Borrador');
    expect(texto(filas[2])).toContain('Próximamente');
  });

  it('"Ver en la web" solo en los publicados', async () => {
    const { el } = await montar([fila({}), fila({ id: 2, slug: 'b', estado: 'BORRADOR' })]);
    const enlaces = Array.from(el.querySelectorAll('a')).filter((a) => a.textContent?.includes('Ver en la web'));
    expect(enlaces.length).toBe(1);
    expect(enlaces[0].getAttribute('href')).toBe('/cursos/a');
  });

  it('"Nuevo curso" pide título y navega al curso creado', async () => {
    const crearCurso = vi.fn(() => of({ id: 9 }));
    const { fixture, el } = await montar([], { crearCurso });
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    el.querySelector<HTMLButtonElement>('button.nuevo')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const input = el.querySelector<HTMLInputElement>('#titulo-nuevo')!;
    input.value = 'Curso Z';
    input.dispatchEvent(new Event('input'));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(crearCurso).toHaveBeenCalledWith('Curso Z');
    expect(nav).toHaveBeenCalledWith('/admin/cursos/9');
  });
});
