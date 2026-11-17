import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('entregar hace POST con el mapa de respuestas', () => {
    api.entregar('abc', { 5: 2 }).subscribe();
    const req = http.expectOne('/api/intentos/abc/entrega');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ respuestas: { '5': 2 } });
    req.flush({ nota: 100, aprobado: true, notaMinima: 75, aciertos: 20, total: 20 });
  });

  it('curso pide el curso por slug', () => {
    let titulo = '';
    api.curso('manipulador-alimentos').subscribe((c) => (titulo = c.titulo));
    http.expectOne('/api/cursos/manipulador-alimentos').flush({ titulo: 'Curso', temas: [] });
    expect(titulo).toBe('Curso');
  });

  it('catalogo pide la lista pública de cursos', () => {
    let n = -1;
    api.catalogo().subscribe((c) => (n = c.length));
    const req = http.expectOne('/api/cursos');
    expect(req.request.method).toBe('GET');
    req.flush([
      { slug: 'a', titulo: 'A', resumen: '', horas: 10, precioCentimos: 1990, estado: 'PUBLICADO', imagenUrl: null },
    ]);
    expect(n).toBe(1);
  });

  it('cursoDeIntento pide el curso del intento', () => {
    let slug = '';
    api.cursoDeIntento('int 1').subscribe((c) => (slug = c.slug));
    http.expectOne('/api/intentos/int%201/curso').flush({ slug: 'a', titulo: 'A', precioCentimos: 1990 });
    expect(slug).toBe('a');
  });

  it('verificar codifica el código en la URL', () => {
    api.verificar('MA AAAA').subscribe();
    http.expectOne('/api/verificar/MA%20AAAA').flush({ valido: false });
  });

  it('urlDescarga construye la URL con el token codificado', () => {
    expect(api.urlDescarga('MA-AAAA-BBBB', 't')).toBe('/api/diplomas/MA-AAAA-BBBB/pdf?token=t');
    expect(api.urlDescarga('MA-AAAA-BBBB', 'a+b')).toBe('/api/diplomas/MA-AAAA-BBBB/pdf?token=a%2Bb');
  });
});
