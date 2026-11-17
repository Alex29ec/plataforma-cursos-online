import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { PedidoEstado } from '../../core/modelos';
import { PedidoPagina } from './pedido';

const PAGADO: PedidoEstado = { pedidoId: 'ped-1', estado: 'PAGADO', importeCentimos: 1990 };
const EMITIDO: PedidoEstado = {
  pedidoId: 'ped-1',
  estado: 'EMITIDO',
  importeCentimos: 1990,
  codigoDiploma: 'MA-AAAA-BBBB',
  tokenDescarga: 'tok',
};
const PENDIENTE: PedidoEstado = { pedidoId: 'ped-1', estado: 'PENDIENTE_PAGO', importeCentimos: 1990 };

describe('PedidoPagina', () => {
  let api: { pedido: ReturnType<typeof vi.fn>; urlDescarga: (c: string, t: string) => string };

  async function montar(...respuestas: PedidoEstado[]) {
    const pedido = vi.fn();
    respuestas.forEach((r) => pedido.mockReturnValueOnce(of(r)));
    pedido.mockReturnValue(of(respuestas[respuestas.length - 1]));
    api = { pedido, urlDescarga: (c, t) => `/api/diplomas/${c}/pdf?token=${t}` };
    TestBed.configureTestingModule({
      imports: [PedidoPagina],
      providers: [provideRouter([]), { provide: ApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(PedidoPagina);
    fixture.componentRef.setInput('pedidoId', 'ped-1');
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => vi.useRealTimers());

  it('con estado EMITIDO muestra el código y el enlace de descarga', async () => {
    const fixture = await montar(EMITIDO);
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('MA-AAAA-BBBB');
    });
    const enlace = fixture.nativeElement.querySelector('a.descargar') as HTMLAnchorElement;
    expect(enlace.getAttribute('href')).toBe('/api/diplomas/MA-AAAA-BBBB/pdf?token=tok');
  });

  it('con estado PAGADO vuelve a consultar cada 2 s hasta EMITIDO', async () => {
    vi.useFakeTimers();
    const fixture = await montar(PAGADO, PAGADO, EMITIDO);
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('preparando tu diploma');
    expect(api.pedido).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    expect(api.pedido).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(2000);
    expect(api.pedido).toHaveBeenCalledTimes(3);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('MA-AAAA-BBBB');

    await vi.advanceTimersByTimeAsync(10000);
    expect(api.pedido).toHaveBeenCalledTimes(3);
  });

  it('con estado PENDIENTE_PAGO muestra pago pendiente, aviso de no pagar dos veces y botón para pagar', async () => {
    const fixture = await montar(PENDIENTE);
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Pago pendiente');
    });
    expect(fixture.nativeElement.textContent).toContain('Si ya has pagado, no vuelvas a pagar');
    expect(fixture.nativeElement.querySelector('a.pagar')).toBeTruthy();
  });

  it('un error de red puntual no muestra "no encontramos tu pedido" y sigue consultando', async () => {
    vi.useFakeTimers();
    const pedido = vi
      .fn()
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 502 })))
      .mockReturnValue(of(EMITIDO));
    api = { pedido, urlDescarga: (c, t) => `/api/diplomas/${c}/pdf?token=${t}` };
    TestBed.configureTestingModule({
      imports: [PedidoPagina],
      providers: [provideRouter([]), { provide: ApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(PedidoPagina);
    fixture.componentRef.setInput('pedidoId', 'ped-1');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('No encontramos tu pedido');

    await vi.advanceTimersByTimeAsync(2000);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('MA-AAAA-BBBB');
  });

  it('un 404 muestra que no se encuentra el pedido', async () => {
    const pedido = vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    api = { pedido, urlDescarga: (c, t) => `/api/diplomas/${c}/pdf?token=${t}` };
    TestBed.configureTestingModule({
      imports: [PedidoPagina],
      providers: [provideRouter([]), { provide: ApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(PedidoPagina);
    fixture.componentRef.setInput('pedidoId', 'ped-1');
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('No encontramos tu pedido');
    });
  });
});
