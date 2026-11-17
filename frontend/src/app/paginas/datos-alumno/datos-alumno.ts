import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AlmacenLocalService } from '../../core/almacen-local.service';
import { dniNieValidator } from '../../core/dni-nie';
import { DatosAlumno, ErrorApi, formatearPrecio } from '../../core/modelos';
import { NAVEGADOR } from '../../core/navegador';

@Component({
  selector: 'app-datos-alumno',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './datos-alumno.html',
  styles: `
    .formulario { max-width: 560px; margin: 0 auto; }
    .check { display: flex; gap: 10px; align-items: flex-start; margin: 8px 0 4px; }
    .check input { width: 20px; height: 20px; margin-top: 2px; accent-color: var(--color-primario); flex: none; }
    .doble { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0 16px; }
    .precio { font-size: 1.1em; }
  `,
})
export class DatosAlumnoPagina {
  private readonly api = inject(ApiService);
  private readonly almacen = inject(AlmacenLocalService);
  private readonly navegador = inject(NAVEGADOR);

  readonly intentoId = input.required<string>();

  /** Curso del intento: da el precio del botón y el enlace al examen. */
  protected readonly curso = toSignal(
    toObservable(this.intentoId).pipe(
      switchMap((id) => this.api.cursoDeIntento(id).pipe(catchError(() => of(undefined)))),
    ),
  );
  protected readonly precio = formatearPrecio;
  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(150)]],
    dni: ['', [Validators.required, dniNieValidator()]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    aceptaPrivacidad: [false, Validators.requiredTrue],
  });

  protected mostrarError(campo: keyof DatosAlumno): string | null {
    const c = this.form.controls[campo];
    if (this.erroresServidor()[campo]) {
      return this.erroresServidor()[campo];
    }
    if (!c.invalid || !(c.touched || this.enviado())) {
      return null;
    }
    switch (campo) {
      case 'nombre':
        return 'El nombre es obligatorio';
      case 'apellidos':
        return 'Los apellidos son obligatorios';
      case 'dni':
        return 'El DNI/NIE no es válido';
      case 'email':
        return 'El email no es válido';
      case 'aceptaPrivacidad':
        return 'Debes aceptar la política de privacidad';
    }
  }

  enviar(): void {
    this.enviado.set(true);
    this.errorGeneral.set(null);
    this.erroresServidor.set({});
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const v = this.form.getRawValue();
    const datos: DatosAlumno = {
      nombre: v.nombre.trim(),
      apellidos: v.apellidos.trim(),
      dni: v.dni.trim(),
      email: v.email.trim(),
      aceptaPrivacidad: v.aceptaPrivacidad,
    };
    this.api.crearPedido(this.intentoId(), datos).subscribe({
      next: (p) => {
        this.almacen.guardarPedido(p.pedidoId);
        this.navegador.irA(p.urlPago);
      },
      error: (e: HttpErrorResponse) => {
        this.enviando.set(false);
        const cuerpo = e.error as ErrorApi | null;
        if (e.status === 400 && cuerpo?.campos) {
          this.erroresServidor.set(cuerpo.campos);
        } else if (e.status === 409) {
          this.errorGeneral.set(cuerpo?.error ?? 'No se puede crear el pedido para este examen.');
        } else if (e.status === 404) {
          this.errorGeneral.set('No encontramos tu examen. Vuelve a hacerlo para obtener el diploma.');
        } else {
          this.errorGeneral.set('No se ha podido iniciar el pago. Inténtalo de nuevo en unos minutos.');
        }
      },
    });
  }
}
