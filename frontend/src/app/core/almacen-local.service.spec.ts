import { TestBed } from '@angular/core/testing';
import { AlmacenLocalService } from './almacen-local.service';

describe('AlmacenLocalService', () => {
  let almacen: AlmacenLocalService;

  beforeEach(() => {
    localStorage.clear();
    almacen = TestBed.inject(AlmacenLocalService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('guarda y lee el intento aprobado y el pedido', () => {
    almacen.guardarIntentoAprobado('i1');
    almacen.guardarPedido('p1');
    expect(almacen.intentoAprobado()).toBe('i1');
    expect(almacen.pedido()).toBe('p1');
  });

  it('limpiar borra ambos', () => {
    almacen.guardarIntentoAprobado('i1');
    almacen.guardarPedido('p1');
    almacen.limpiar();
    expect(almacen.intentoAprobado()).toBeNull();
    expect(almacen.pedido()).toBeNull();
  });

  it('si localStorage falla no propaga el error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(() => almacen.guardarIntentoAprobado('i1')).not.toThrow();
    expect(almacen.intentoAprobado()).toBeNull();
  });
});
