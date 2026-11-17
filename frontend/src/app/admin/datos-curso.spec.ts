import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminApiService } from './admin-api.service';
import { DatosCurso } from './datos-curso';
import { CursoAdmin } from './modelos-admin';

const curso = (o: Partial<CursoAdmin> = {}): CursoAdmin => ({
  id: 5,
  slug: 'prl-basico',
  titulo: 'PRL básico',
  resumen: 'Resumen',
  descripcion: 'Descripción',
  horas: 20,
  precioCentimos: 1990,
  notaMinima: 70,
  numPreguntas: 20,
  orden: 1,
  estado: 'BORRADOR',
  imagenUrl: null,
  ...o,
});

describe('DatosCurso', () => {
  async function montar(c: CursoAdmin, api: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({
      imports: [DatosCurso],
      providers: [{ provide: AdminApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(DatosCurso);
    fixture.componentRef.setInput('curso', c);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const escribir = async (sel: string, valor: string) => {
      const i = el.querySelector<HTMLInputElement>(sel)!;
      i.value = valor;
      i.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const enviar = async () => {
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, el, escribir, enviar };
  }

  it.each([['19,90'], ['19.90']])('el precio "%s" se envía como 1990 céntimos', async (txt) => {
    const guardarCurso = vi.fn((_id: number, _d: unknown) => of(curso()));
    const { escribir, enviar } = await montar(curso({ precioCentimos: 500 }), { guardarCurso });
    await escribir('#precio', txt);
    await enviar();
    expect(guardarCurso).toHaveBeenCalledTimes(1);
    expect((guardarCurso.mock.calls[0][1] as { precioCentimos: number }).precioCentimos).toBe(1990);
  });

  it('el precio entero "19" son 1900 céntimos y uno inválido no se envía', async () => {
    const guardarCurso = vi.fn((_id: number, _d: unknown) => of(curso()));
    const { el, escribir, enviar } = await montar(curso(), { guardarCurso });
    await escribir('#precio', '19');
    await enviar();
    expect((guardarCurso.mock.calls[0][1] as { precioCentimos: number }).precioCentimos).toBe(1900);
    guardarCurso.mockClear();
    await escribir('#precio', 'abc');
    await enviar();
    expect(guardarCurso).not.toHaveBeenCalled();
    expect(el.querySelector('#precio')!.closest('.campo')!.querySelector('.error-campo')?.textContent).toContain('precio');
  });

  it('muestra los errores 400 junto a su campo', async () => {
    const guardarCurso = vi.fn(() =>
      throwError(() => new HttpErrorResponse({ status: 400, error: { error: 'x', campos: { titulo: 'Obligatorio' } } })),
    );
    const { el, enviar } = await montar(curso(), { guardarCurso });
    await enviar();
    const campo = el.querySelector('#titulo')!.closest('.campo')!;
    expect(campo.querySelector('.error-campo')?.textContent).toContain('Obligatorio');
  });

  it('el 409 al publicar se muestra tal cual en un aviso', async () => {
    const cambiarEstado = vi.fn(() =>
      throwError(() => new HttpErrorResponse({ status: 409, error: { error: 'El curso no tiene temas' } })),
    );
    const { fixture, el } = await montar(curso(), { cambiarEstado });
    const sel = el.querySelector<HTMLSelectElement>('#estado')!;
    sel.value = 'PUBLICADO';
    sel.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(cambiarEstado).toHaveBeenCalledWith(5, 'PUBLICADO');
    expect(el.querySelector('.aviso.error')?.textContent).toContain('El curso no tiene temas');
    expect(sel.value).toBe('BORRADOR');
  });

  it('el slug está deshabilitado si el estado no es BORRADOR', async () => {
    const a = await montar(curso({ estado: 'PUBLICADO' }));
    expect(a.el.querySelector<HTMLInputElement>('#slug')!.disabled).toBe(true);
    TestBed.resetTestingModule();
    const b = await montar(curso({ estado: 'BORRADOR' }));
    expect(b.el.querySelector<HTMLInputElement>('#slug')!.disabled).toBe(false);
  });

  it('subir un fichero llama subirImagen y actualiza la vista previa', async () => {
    const subirImagen = vi.fn(() => of(curso({ imagenUrl: '/imagenes/5.jpg' })));
    const { fixture, el } = await montar(curso(), { subirImagen });
    const fichero = new File(['x'], 'foto.png', { type: 'image/png' });
    const input = el.querySelector<HTMLInputElement>('input[type=file]')!;
    Object.defineProperty(input, 'files', { value: [fichero] });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(subirImagen).toHaveBeenCalledWith(5, fichero);
    expect(el.querySelector('img.vista-previa')?.getAttribute('src')).toBe('/imagenes/5.jpg');
  });

  it('tieneCambios refleja las ediciones sin guardar', async () => {
    const { fixture, escribir } = await montar(curso());
    const cmp = fixture.componentInstance;
    expect(cmp.tieneCambios()).toBe(false);
    await escribir('#titulo', 'Otro');
    expect(cmp.tieneCambios()).toBe(true);
  });
});

describe('DatosCurso (avisos y fichero)', () => {
  async function montar(api: Record<string, unknown>) {
    TestBed.configureTestingModule({
      imports: [DatosCurso],
      providers: [{ provide: AdminApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(DatosCurso);
    fixture.componentRef.setInput('curso', curso());
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('guardar los datos con éxito borra el aviso de error del estado', async () => {
    const cambiarEstado = vi.fn(() =>
      throwError(() => new HttpErrorResponse({ status: 409, error: { error: 'El curso no tiene temas' } })),
    );
    const guardarCurso = vi.fn(() => of(curso()));
    const { fixture, el } = await montar({ cambiarEstado, guardarCurso });
    const sel = el.querySelector<HTMLSelectElement>('#estado')!;
    sel.value = 'PUBLICADO';
    sel.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(el.textContent).toContain('El curso no tiene temas');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(guardarCurso).toHaveBeenCalled();
    expect(el.textContent).not.toContain('El curso no tiene temas');
  });

  it.each([
    ['un tipo no admitido', new File(['x'], 'nota.txt', { type: 'text/plain' })],
    ['un fichero de más de 5 MB', new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' })],
  ])('al rechazar %s se vacía el selector para poder volver a elegirlo', async (_caso, fichero) => {
    const subirImagen = vi.fn();
    const { fixture, el } = await montar({ subirImagen });
    const input = el.querySelector<HTMLInputElement>('input[type=file]')!;
    const valor = vi.fn();
    Object.defineProperty(input, 'files', { value: [fichero] });
    Object.defineProperty(input, 'value', { configurable: true, get: () => 'grande.png', set: valor });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(subirImagen).not.toHaveBeenCalled();
    expect(el.querySelector('.aviso.error')).not.toBeNull();
    expect(valor).toHaveBeenCalledWith('');
  });
});
