import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AlmacenLocalService } from '../../core/almacen-local.service';
import { NAVEGADOR } from '../../core/navegador';
import { DatosAlumnoPagina } from './datos-alumno';

describe('DatosAlumnoPagina', () => {
  let api: { crearPedido: ReturnType<typeof vi.fn>; cursoDeIntento: ReturnType<typeof vi.fn> };
  let navegador: { irA: ReturnType<typeof vi.fn> };

  async function montar() {
    api = {
      crearPedido: vi.fn().mockReturnValue(of({ pedidoId: 'ped-1', urlPago: 'https://pago/x' })),
      cursoDeIntento: vi.fn().mockReturnValue(of({ slug: 'curso-x', titulo: 'Curso X', precioCentimos: 2490 })),
    };
    navegador = { irA: vi.fn() };
    TestBed.configureTestingModule({
      imports: [DatosAlumnoPagina],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: NAVEGADOR, useValue: navegador },
      ],
    });
    const fixture = TestBed.createComponent(DatosAlumnoPagina);
    fixture.componentRef.setInput('intentoId', 'int-1');
    await fixture.whenStable();
    return fixture;
  }

  function escribir(el: HTMLElement, id: string, valor: string) {
    const input = el.querySelector<HTMLInputElement>('#' + id)!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  }

  function rellenar(el: HTMLElement, dni: string, acepta: boolean) {
    escribir(el, 'nombre', 'Ana');
    escribir(el, 'apellidos', 'García');
    escribir(el, 'dni', dni);
    escribir(el, 'email', 'ana@example.com');
    const check = el.querySelector<HTMLInputElement>('#acepta')!;
    if (check.checked !== acepta) check.click();
  }

  it('el botón muestra el precio del curso del intento', async () => {
    const fixture = await montar();
    const el: HTMLElement = fixture.nativeElement;
    expect(api.cursoDeIntento).toHaveBeenCalledWith('int-1');
    const boton = el.querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(boton.textContent!.replace(/ /g, ' ')).toContain('Pagar 24,90 €');
  });

  it('no envía sin aceptar la privacidad', async () => {
    const fixture = await montar();
    const el: HTMLElement = fixture.nativeElement;
    rellenar(el, '12345678Z', false);
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    expect(api.crearPedido).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Debes aceptar la política de privacidad');
  });

  it('no envía con un DNI incorrecto', async () => {
    const fixture = await montar();
    const el: HTMLElement = fixture.nativeElement;
    rellenar(el, '12345678A', true);
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    expect(api.crearPedido).not.toHaveBeenCalled();
    expect(el.textContent).toContain('El DNI/NIE no es válido');
  });

  it('con datos válidos crea el pedido, lo guarda y va a la página de pago', async () => {
    const fixture = await montar();
    const almacen = TestBed.inject(AlmacenLocalService);
    const guardar = vi.spyOn(almacen, 'guardarPedido');
    const el: HTMLElement = fixture.nativeElement;
    rellenar(el, '12345678z', true);
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    expect(api.crearPedido).toHaveBeenCalledWith('int-1', {
      nombre: 'Ana',
      apellidos: 'García',
      dni: '12345678z',
      email: 'ana@example.com',
      aceptaPrivacidad: true,
    });
    expect(guardar).toHaveBeenCalledWith('ped-1');
    expect(navegador.irA).toHaveBeenCalledWith('https://pago/x');
  });
});
