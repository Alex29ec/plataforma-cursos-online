import { FormControl } from '@angular/forms';
import { dniNieValidator, esDniNieValido } from './dni-nie';

describe('DNI/NIE', () => {
  it('acepta DNI y NIE con letra correcta', () => {
    expect(esDniNieValido('12345678Z')).toBe(true);
    expect(esDniNieValido('X1234567L')).toBe(true);
    expect(esDniNieValido('Y1234567X')).toBe(true);
  });

  it('normaliza minúsculas, espacios y guiones', () => {
    expect(esDniNieValido('x-1234567-l')).toBe(true);
    expect(esDniNieValido(' 12345678z ')).toBe(true);
  });

  it('rechaza letra incorrecta, vacíos y formatos raros', () => {
    expect(esDniNieValido('12345678A')).toBe(false);
    expect(esDniNieValido('')).toBe(false);
    expect(esDniNieValido(null)).toBe(false);
    expect(esDniNieValido('1234Z')).toBe(false);
    expect(esDniNieValido('ABCDEFGHZ')).toBe(false);
  });

  it('el validador devuelve el error dniNie', () => {
    expect(dniNieValidator()(new FormControl('12345678A'))).toEqual({ dniNie: true });
    expect(dniNieValidator()(new FormControl('12345678Z'))).toBeNull();
  });
});
