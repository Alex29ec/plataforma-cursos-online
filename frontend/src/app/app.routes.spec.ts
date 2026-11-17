import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('rutas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding()), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  async function ir(url: string): Promise<string> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return TestBed.inject(Router).url;
  }

  it('/curso redirige al curso de manipulador de alimentos', async () => {
    expect(await ir('/curso')).toBe('/cursos/manipulador-alimentos');
  });

  it('/curso/tema/2 redirige al tema 2 de manipulador de alimentos', async () => {
    expect(await ir('/curso/tema/2')).toBe('/cursos/manipulador-alimentos/tema/2');
  });

  it('/examen redirige al examen de manipulador de alimentos', async () => {
    expect(await ir('/examen')).toBe('/cursos/manipulador-alimentos/examen');
  });

  it('las rutas por slug no redirigen', async () => {
    expect(await ir('/cursos/otro')).toBe('/cursos/otro');
  });
});
