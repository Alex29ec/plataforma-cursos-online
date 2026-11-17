import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminApiService } from './admin-api.service';
import { PreguntaAdmin } from './modelos-admin';
import { PreguntasCurso } from './preguntas-curso';

const preg = (id: number, enunciado: string, activa = true): PreguntaAdmin => ({
  id,
  enunciado,
  opciones: ['a', 'b'],
  correcta: 0,
  activa,
});

describe('PreguntasCurso', () => {
  async function montar(lista: PreguntaAdmin[], api: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({
      imports: [PreguntasCurso],
      providers: [{ provide: AdminApiService, useValue: { preguntas: () => of(lista), ...api } }],
    });
    const fixture = TestBed.createComponent(PreguntasCurso);
    fixture.componentRef.setInput('cursoId', 5);
    fixture.componentRef.setInput('numPreguntas', 20);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const boton = (txt: string) => Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === txt)!;
    const pulsar = async (txt: string) => {
      boton(txt).click();
      await fixture.whenStable();
    };
    const poner = async (sel: string, v: string) => {
      const i = el.querySelector<HTMLInputElement>(sel)!;
      i.value = v;
      i.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    return { fixture, el, boton, pulsar, poner };
  }
  const opciones = (el: HTMLElement) => el.querySelectorAll('.opcion');

  it('una pregunta nueva empieza con 4 opciones; "Añadir opción" llega a 6 y se deshabilita', async () => {
    const { el, boton, pulsar } = await montar([]);
    await pulsar('Nueva pregunta');
    expect(opciones(el).length).toBe(4);
    await pulsar('Añadir opción');
    await pulsar('Añadir opción');
    expect(opciones(el).length).toBe(6);
    expect(boton('Añadir opción').disabled).toBe(true);
  });

  it('"Quitar" baja hasta 2 opciones y entonces se deshabilita', async () => {
    const { fixture, el, pulsar } = await montar([]);
    await pulsar('Nueva pregunta');
    for (let i = 0; i < 2; i++) {
      el.querySelector<HTMLButtonElement>('.opcion button.quitar')!.click();
      await fixture.whenStable();
    }
    expect(opciones(el).length).toBe(2);
    expect(Array.from(el.querySelectorAll<HTMLButtonElement>('.opcion button.quitar')).every((b) => b.disabled)).toBe(true);
  });

  it('no guarda sin marcar la correcta ni con opciones vacías', async () => {
    const crearPregunta = vi.fn((_id: number, _d: unknown) => of(preg(9, 'x')));
    const { fixture, el, pulsar, poner } = await montar([], { crearPregunta });
    await pulsar('Nueva pregunta');
    const enviar = async () => {
      el.querySelector('form.editor-pregunta')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    await poner('#enunciado', '¿Pregunta?');
    await enviar();
    expect(crearPregunta).not.toHaveBeenCalled();
    expect(el.querySelector('.aviso.error')).not.toBeNull();
    for (let i = 1; i <= 4; i++) await poner(`div.opcion:nth-of-type(${i}) input[type=text]`, `op${i}`);
    await enviar();
    expect(crearPregunta).not.toHaveBeenCalled(); // sin correcta
    el.querySelector<HTMLInputElement>('.opcion input[type=radio]')!.click();
    await fixture.whenStable();
    await poner('div.opcion:nth-of-type(2) input[type=text]', '');
    await enviar();
    expect(crearPregunta).not.toHaveBeenCalled(); // opción vacía
    await poner('div.opcion:nth-of-type(2) input[type=text]', 'ok');
    await enviar();
    expect(crearPregunta).toHaveBeenCalledWith(5, { enunciado: '¿Pregunta?', opciones: ['op1', 'ok', 'op3', 'op4'], correcta: 0 });
  });

  it('muestra el contador de preguntas activas y las que usa el examen', async () => {
    const { el } = await montar([preg(1, 'a'), preg(2, 'b'), preg(3, 'c', false)]);
    expect((el.querySelector('.contador')?.textContent ?? '').replace(/\s+/g, ' ')).toContain('2 preguntas activas · el examen usa 20');
  });

  it('las desactivadas se ven marcadas', async () => {
    const { el } = await montar([preg(1, 'a'), preg(3, 'c', false)]);
    const filas = el.querySelectorAll('li.pregunta');
    expect(filas[1].classList.contains('inactiva')).toBe(true);
    expect(filas[1].textContent).toContain('Desactivada');
  });

  it('el buscador filtra sin distinguir mayúsculas ni acentos', async () => {
    const { el, poner } = await montar([preg(1, 'Qué es la PREVENCIÓN'), preg(2, 'Otra cosa')]);
    await poner('input[type=search]', 'prevencion');
    expect(el.querySelectorAll('li.pregunta').length).toBe(1);
  });

  it('borrar pide confirmación y llama borrarPregunta', async () => {
    const borrarPregunta = vi.fn((_id: number, _p: number) => of(undefined));
    const { fixture, el } = await montar([preg(1, 'a')], { borrarPregunta });
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    el.querySelector<HTMLButtonElement>('li.pregunta button.borrar')!.click();
    await fixture.whenStable();
    expect(confirmar).toHaveBeenCalled();
    expect(borrarPregunta).toHaveBeenCalledWith(5, 1);
    confirmar.mockRestore();
  });
});
