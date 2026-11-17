import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { LayoutAdmin } from './layout-admin';
import { SesionAdminService } from './sesion-admin.service';

describe('LayoutAdmin', () => {
  async function montar(salir: () => Observable<void>) {
    const usuario = signal<string | null>('admin');
    TestBed.configureTestingModule({
      imports: [LayoutAdmin],
      providers: [provideRouter([]), { provide: SesionAdminService, useValue: { salir, usuario } }],
    });
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LayoutAdmin);
    await fixture.whenStable();
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!;
    return { fixture, nav, usuario, boton };
  }

  it('Salir cierra la sesión y va a /admin/entrar', async () => {
    const { fixture, nav, boton } = await montar(() => of(undefined));
    boton.click();
    await fixture.whenStable();
    expect(nav).toHaveBeenCalledWith('/admin/entrar');
  });

  it('si el logout falla, borra el usuario local y va igualmente a /admin/entrar', async () => {
    const { fixture, nav, usuario, boton } = await montar(() => throwError(() => new HttpErrorResponse({ status: 403 })));
    boton.click();
    await fixture.whenStable();
    expect(usuario()).toBeNull();
    expect(nav).toHaveBeenCalledWith('/admin/entrar');
  });
});
