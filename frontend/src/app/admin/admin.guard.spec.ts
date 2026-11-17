import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { adminGuard } from './admin.guard';
import { SesionAdminService } from './sesion-admin.service';

describe('adminGuard', () => {
  function ejecutar(hay: boolean, url = '/admin') {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SesionAdminService, useValue: { comprobar: () => of(hay) } }],
    });
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;
  }

  it('sin sesión redirige a /admin/entrar con la URL de vuelta', () => {
    let res: boolean | UrlTree | undefined;
    ejecutar(false).subscribe((r) => (res = r));
    expect(res instanceof UrlTree).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(res as UrlTree)).toBe('/admin/entrar?volver=%2Fadmin');
  });

  it('con sesión deja pasar', () => {
    let res: boolean | UrlTree | undefined;
    ejecutar(true).subscribe((r) => (res = r));
    expect(res).toBe(true);
  });
});
