import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Misma regla que es.cursos.plataforma.comun.DniNie en el backend.
const LETRAS = 'TRWAGMYFPDXBNJZSQVHLCKE';

export function normalizarDniNie(valor: string | null | undefined): string {
  return (valor ?? '').replace(/[\s-]/g, '').toUpperCase();
}

export function esDniNieValido(valor: string | null | undefined): boolean {
  const v = normalizarDniNie(valor);
  let numero: string;
  if (/^\d{8}[A-Z]$/.test(v)) {
    numero = v.slice(0, 8);
  } else if (/^[XYZ]\d{7}[A-Z]$/.test(v)) {
    numero = 'XYZ'.indexOf(v[0]) + v.slice(1, 8);
  } else {
    return false;
  }
  return LETRAS[Number(numero) % 23] === v[8];
}

export function dniNieValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    esDniNieValido(control.value) ? null : { dniNie: true };
}
