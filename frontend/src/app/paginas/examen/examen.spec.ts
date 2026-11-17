import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AlmacenLocalService } from '../../core/almacen-local.service';
import { IntentoCreado, Resultado } from '../../core/modelos';
import { Examen } from './examen';

const INTENTO: IntentoCreado = {
  intentoId: 'int-1',
  preguntas: [
    { id: 11, enunciado: 'P1', opciones: ['a', 'b', 'c', 'd'] },
    { id: 12, enunciado: 'P2', opciones: ['a', 'b', 'c', 'd'] },
    { id: 13, enunciado: 'P3', opciones: ['a', 'b', 'c', 'd'] },
  ],
};

describe('Examen', () => {
  let api: { crearIntento: ReturnType<typeof vi.fn>; entregar: ReturnType<typeof vi.fn> };
  let almacen: AlmacenLocalService;
  let router: Router;

  async function montar(resultado: Resultado) {
    api = {
      crearIntento: vi.fn().mockReturnValue(of(INTENTO)),
      entregar: vi.fn().mockReturnValue(of(resultado)),
    };
    TestBed.configureTestingModule({
      imports: [Examen],
      providers: [provideRouter([]), { provide: ApiService, useValue: api }],
    });
    almacen = TestBed.inject(AlmacenLocalService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(almacen, 'guardarIntentoAprobado');
    const fixture = TestBed.createComponent(Examen);
    fixture.componentRef.setInput('slug', 'curso-x');
    await fixture.whenStable();
    return fixture;
  }

  function elegir(el: HTMLElement, preguntaId: number, opcion: number) {
    const radio = el.querySelector<HTMLInputElement>(`input[name="p${preguntaId}"][value="${opcion}"]`)!;
    radio.click();
  }

  it('crea el intento del curso indicado por el slug', async () => {
    await montar({ nota: 100, aprobado: true, notaMinima: 75, aciertos: 3, total: 3 });
    expect(api.crearIntento).toHaveBeenCalledWith('curso-x');
  });

  it('el botón Entregar está deshabilitado hasta responder todas', async () => {
    const fixture = await montar({ nota: 100, aprobado: true, notaMinima: 75, aciertos: 3, total: 3 });
    const el: HTMLElement = fixture.nativeElement;
    const boton = () => el.querySelector<HTMLButtonElement>('#entregar')!;
    expect(el.textContent).toContain('0 de 3 respondidas');
    expect(boton().disabled).toBe(true);
    elegir(el, 11, 0);
    elegir(el, 12, 1);
    await fixture.whenStable();
    expect(boton().disabled).toBe(true);
    elegir(el, 13, 2);
    await fixture.whenStable();
    expect(el.textContent).toContain('3 de 3 respondidas');
    expect(boton().disabled).toBe(false);
  });

  it('al confirmar la entrega envía las respuestas y guarda el intento si aprueba', async () => {
    const resultado = { nota: 100, aprobado: true, notaMinima: 75, aciertos: 3, total: 3 };
    const fixture = await montar(resultado);
    const el: HTMLElement = fixture.nativeElement;
    elegir(el, 11, 0);
    elegir(el, 12, 1);
    elegir(el, 13, 3);
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('#entregar')!.click();
    await fixture.whenStable();
    expect(api.entregar).not.toHaveBeenCalled();
    el.querySelector<HTMLButtonElement>('#confirmar')!.click();
    await fixture.whenStable();

    expect(api.entregar).toHaveBeenCalledWith('int-1', { 11: 0, 12: 1, 13: 3 });
    expect(almacen.guardarIntentoAprobado).toHaveBeenCalledWith('int-1');
    expect(router.navigate).toHaveBeenCalledWith(['/resultado'], {
      state: { resultado, intentoId: 'int-1', slug: 'curso-x' },
    });
  });

  it('si suspende no guarda el intento', async () => {
    const fixture = await montar({ nota: 0, aprobado: false, notaMinima: 75, aciertos: 0, total: 3 });
    const el: HTMLElement = fixture.nativeElement;
    elegir(el, 11, 1);
    elegir(el, 12, 1);
    elegir(el, 13, 1);
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('#entregar')!.click();
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('#confirmar')!.click();
    await fixture.whenStable();
    expect(api.entregar).toHaveBeenCalled();
    expect(almacen.guardarIntentoAprobado).not.toHaveBeenCalled();
  });
});
