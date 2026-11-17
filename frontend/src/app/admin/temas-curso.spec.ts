import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminApiService } from './admin-api.service';
import { TemaAdmin } from './modelos-admin';
import { TemasCurso } from './temas-curso';

const tema = (id: number, orden: number): TemaAdmin => ({ id, orden, titulo: `Tema ${id}`, contenido: `c${id}` });

describe('TemasCurso', () => {
  async function montar(api: Record<string, unknown>) {
    TestBed.configureTestingModule({ imports: [TemasCurso], providers: [{ provide: AdminApiService, useValue: api }] });
    const fixture = TestBed.createComponent(TemasCurso);
    fixture.componentRef.setInput('cursoId', 5);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }
  const boton = (el: HTMLElement, fila: number, etiqueta: string) =>
    Array.from(el.querySelectorAll('li.tema')[fila].querySelectorAll('button')).find((b) => b.getAttribute('aria-label') === etiqueta)!;

  it('subir y bajar llaman ordenarTemas con los ids en el nuevo orden', async () => {
    const ordenarTemas = vi.fn((_id: number, _ids: number[]) => of([tema(2, 1), tema(1, 2), tema(3, 3)]));
    const { fixture, el } = await montar({ temas: () => of([tema(1, 1), tema(2, 2), tema(3, 3)]), ordenarTemas });
    boton(el, 1, 'Subir').click();
    await fixture.whenStable();
    expect(ordenarTemas).toHaveBeenCalledWith(5, [2, 1, 3]);
    ordenarTemas.mockClear();
    boton(el, 0, 'Bajar').click();
    await fixture.whenStable();
    expect(ordenarTemas).toHaveBeenCalledWith(5, [1, 2, 3]);
  });

  it('la vista previa renderiza **hola** como <strong>hola</strong>', async () => {
    const { fixture, el } = await montar({ temas: () => of([tema(1, 1)]) });
    Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Nuevo tema'))!.click();
    await fixture.whenStable();
    const area = el.querySelector<HTMLTextAreaElement>('textarea')!;
    area.value = '**hola**';
    area.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(el.querySelector('.previa strong')?.outerHTML).toBe('<strong>hola</strong>');
  });

  it('borrar pide confirmación y llama borrarTema', async () => {
    const borrarTema = vi.fn((_id: number, _t: number) => of(undefined));
    const { fixture, el } = await montar({ temas: () => of([tema(1, 1), tema(2, 2)]), borrarTema });
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    boton(el, 1, 'Borrar').click();
    await fixture.whenStable();
    expect(confirmar).toHaveBeenCalled();
    expect(borrarTema).toHaveBeenCalledWith(5, 2);
    confirmar.mockRestore();
  });
});
