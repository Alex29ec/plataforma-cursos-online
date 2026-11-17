import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminApiService } from './admin-api.service';
import { Entrar } from './entrar';

describe('Entrar', () => {
  async function montar(login: unknown, volver: string | null = null) {
    const api = { csrf: vi.fn(() => of(void 0)), login: vi.fn(() => login) };
    TestBed.configureTestingModule({
      imports: [Entrar],
      providers: [
        provideRouter([]),
        { provide: AdminApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => volver } } } },
      ],
    });
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Entrar);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const escribir = (id: string, v: string) => {
      const i = el.querySelector<HTMLInputElement>(id)!;
      i.value = v;
      i.dispatchEvent(new Event('input'));
    };
    escribir('#usuario', 'admin');
    escribir('#password', 'secreto');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
    return { api, nav, el };
  }

  it('pide el token CSRF y luego hace login; navega a /admin', async () => {
    const { api, nav } = await montar(of(void 0));
    expect(api.csrf).toHaveBeenCalled();
    expect(api.login).toHaveBeenCalledWith('admin', 'secreto');
    expect(nav).toHaveBeenCalledWith('/admin');
  });

  it('navega a la URL de vuelta si es interna', async () => {
    const { nav } = await montar(of(void 0), '/admin/cursos/3');
    expect(nav).toHaveBeenCalledWith('/admin/cursos/3');
  });

  it('ignora una URL de vuelta externa', async () => {
    const { nav } = await montar(of(void 0), '//malo.com');
    expect(nav).toHaveBeenCalledWith('/admin');
  });

  it('401 muestra credenciales incorrectas', async () => {
    const { el, nav } = await montar(throwError(() => new HttpErrorResponse({ status: 401 })));
    expect(el.textContent).toContain('Usuario o contraseña incorrectos');
    expect(nav).not.toHaveBeenCalled();
  });

  it('429 muestra el bloqueo', async () => {
    const { el } = await montar(throwError(() => new HttpErrorResponse({ status: 429 })));
    expect(el.textContent).toContain('Demasiados intentos. Espera 15 minutos.');
  });

  it('otros errores muestran el mensaje del servidor si lo hay (p. ej. la demo sin servidor)', async () => {
    const { el } = await montar(
      throwError(() => new HttpErrorResponse({ status: 503, error: { error: 'No disponible en la demo.' } })),
    );
    expect(el.textContent).toContain('No disponible en la demo.');
  });
});
