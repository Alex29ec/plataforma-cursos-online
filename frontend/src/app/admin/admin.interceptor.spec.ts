import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { adminInterceptor } from './admin.interceptor';
import { SesionAdminService } from './sesion-admin.service';

describe('adminInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let nav: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([adminInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/admin/cursos/3');
    nav = vi.spyOn(router, 'navigate').mockResolvedValue(true) as unknown as ReturnType<typeof vi.fn>;
  });

  afterEach(() => ctrl.verify());

  it('401 en /api/admin/cursos navega a entrar con la URL actual', () => {
    http.get('/api/admin/cursos').subscribe({ error: () => undefined });
    ctrl.expectOne('/api/admin/cursos').flush({}, { status: 401, statusText: 'No' });
    expect(nav).toHaveBeenCalledWith(['/admin/entrar'], { queryParams: { volver: '/admin/cursos/3' } });
  });

  it('401 en /api/admin/login no navega', () => {
    http.post('/api/admin/login', {}).subscribe({ error: () => undefined });
    ctrl.expectOne('/api/admin/login').flush({}, { status: 401, statusText: 'No' });
    expect(nav).not.toHaveBeenCalled();
  });

  it('401 fuera de /api/admin no navega', () => {
    http.get('/api/cursos').subscribe({ error: () => undefined });
    ctrl.expectOne('/api/cursos').flush({}, { status: 401, statusText: 'No' });
    expect(nav).not.toHaveBeenCalled();
  });
});

describe('adminInterceptor (403 tras cerrar sesión en otra pestaña)', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let nav: ReturnType<typeof vi.fn>;
  let sesion: SesionAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([adminInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    sesion = TestBed.inject(SesionAdminService);
    sesion.usuario.set('admin');
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/admin/cursos/3');
    nav = vi.spyOn(router, 'navigate').mockResolvedValue(true) as unknown as ReturnType<typeof vi.fn>;
  });

  afterEach(() => ctrl.verify());

  it('403 y /yo da 401: sesión caducada, borra el usuario y navega a entrar', () => {
    let error: unknown;
    http.put('/api/admin/cursos/3', {}).subscribe({ error: (e) => (error = e) });
    ctrl.expectOne('/api/admin/cursos/3').flush({}, { status: 403, statusText: 'Forbidden' });
    ctrl.expectOne('/api/admin/yo').flush({}, { status: 401, statusText: 'No' });
    expect(sesion.usuario()).toBeNull();
    expect(nav).toHaveBeenCalledWith(['/admin/entrar'], { queryParams: { volver: '/admin/cursos/3' } });
    expect((error as { status: number }).status).toBe(403);
  });

  it('403 y /yo responde bien: no navega', () => {
    http.put('/api/admin/cursos/3', {}).subscribe({ error: () => undefined });
    ctrl.expectOne('/api/admin/cursos/3').flush({}, { status: 403, statusText: 'Forbidden' });
    ctrl.expectOne('/api/admin/yo').flush({ usuario: 'admin' });
    expect(sesion.usuario()).toBe('admin');
    expect(nav).not.toHaveBeenCalled();
  });

  it('403 en /api/admin/login o /api/admin/csrf no consulta /yo', () => {
    http.post('/api/admin/login', {}).subscribe({ error: () => undefined });
    ctrl.expectOne('/api/admin/login').flush({}, { status: 403, statusText: 'Forbidden' });
    http.get('/api/admin/csrf').subscribe({ error: () => undefined });
    ctrl.expectOne('/api/admin/csrf').flush({}, { status: 403, statusText: 'Forbidden' });
    ctrl.expectNone('/api/admin/yo');
    expect(nav).not.toHaveBeenCalled();
  });
});
