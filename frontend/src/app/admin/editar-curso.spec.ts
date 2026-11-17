import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminApiService } from './admin-api.service';
import { cambiosSinGuardarGuard } from './cambios-sin-guardar.guard';
import { EditarCurso } from './editar-curso';
import { CursoAdmin } from './modelos-admin';

const curso: CursoAdmin = {
  id: 5, slug: 'prl', titulo: 'PRL', resumen: '', descripcion: '', horas: 10, precioCentimos: 1000,
  notaMinima: 70, numPreguntas: 5, orden: 0, estado: 'PUBLICADO', imagenUrl: null,
};

describe('EditarCurso', () => {
  it('pide el CSRF antes de cargar el curso, muestra pestañas y "Ver en la web"', async () => {
    const orden: string[] = [];
    const api = {
      csrf: () => { orden.push('csrf'); return of(undefined); },
      curso: () => { orden.push('curso'); return of(curso); },
      temas: () => of([]),
      preguntas: () => of([]),
    };
    TestBed.configureTestingModule({ imports: [EditarCurso], providers: [provideRouter([]), { provide: AdminApiService, useValue: api }] });
    const fixture = TestBed.createComponent(EditarCurso);
    fixture.componentRef.setInput('id', '5');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(orden).toEqual(['csrf', 'curso']);
    expect(Array.from(el.querySelectorAll('[role=tab]')).map((t) => t.textContent?.trim())).toEqual(['Datos', 'Temas', 'Preguntas']);
    expect(el.querySelector('a[href="/cursos/prl"]')).not.toBeNull();
    const titulo = el.querySelector<HTMLInputElement>('#titulo')!;
    titulo.value = 'Otro';
    titulo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.tieneCambios()).toBe(true);
  });
});

describe('cambiosSinGuardarGuard', () => {
  const llamar = (tiene: boolean) =>
    TestBed.runInInjectionContext(() => cambiosSinGuardarGuard({ tieneCambios: () => tiene }, null as never, null as never, null as never));

  it('deja salir sin preguntar si no hay cambios', () => {
    const c = vi.spyOn(window, 'confirm');
    expect(llamar(false)).toBe(true);
    expect(c).not.toHaveBeenCalled();
    c.mockRestore();
  });

  it('con cambios pregunta y respeta la respuesta', () => {
    const c = vi.spyOn(window, 'confirm').mockReturnValue(false);
    expect(llamar(true)).toBe(false);
    expect(c).toHaveBeenCalledWith('Hay cambios sin guardar. ¿Salir igualmente?');
    c.mockReturnValue(true);
    expect(llamar(true)).toBe(true);
    c.mockRestore();
  });
});
