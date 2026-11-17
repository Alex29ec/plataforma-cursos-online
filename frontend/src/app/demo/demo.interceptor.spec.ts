import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { demoInterceptor, reiniciarDemo } from './demo.interceptor';
import { CURSOS_DEMO } from './datos-demo';
import { IntentoCreado, PedidoCreado, PedidoEstado, Resultado, Verificacion } from '../core/modelos';

const SLUG = 'manipulador-alimentos';

describe('demoInterceptor (API simulada para la demo sin servidor)', () => {
  let http: HttpClient;

  function nuevoCliente() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([demoInterceptor]))] });
    http = TestBed.inject(HttpClient);
  }

  beforeEach(() => {
    localStorage.clear();
    nuevoCliente();
  });

  const get = <T>(url: string) => firstValueFrom(http.get<T>(url));
  const post = <T>(url: string, body: unknown = null) => firstValueFrom(http.post<T>(url, body));

  async function aprobar(): Promise<string> {
    const intento = await post<IntentoCreado>(`/api/cursos/${SLUG}/intentos`);
    const correctas = new Map(CURSOS_DEMO[SLUG].preguntas.map((p) => [p.id, p.correcta]));
    const respuestas = Object.fromEntries(intento.preguntas.map((p) => [p.id, correctas.get(p.id)!]));
    const r = await post<Resultado>(`/api/intentos/${intento.intentoId}/entrega`, { respuestas });
    expect(r.aprobado).toBe(true);
    return intento.intentoId;
  }

  it('el catálogo incluye el curso publicado y los próximos', async () => {
    const cat = await get<{ slug: string; estado: string }[]>('/api/cursos');
    expect(cat.find((c) => c.slug === SLUG)?.estado).toBe('PUBLICADO');
    expect(cat.filter((c) => c.estado === 'PROXIMAMENTE').length).toBe(5);
  });

  it('un curso inexistente o próximo responde 404', async () => {
    await expect(get('/api/cursos/carretilla-elevadora')).rejects.toBeInstanceOf(HttpErrorResponse);
    await expect(get('/api/cursos/nada/temas/1')).rejects.toMatchObject({ status: 404 });
  });

  it('el examen no envía la respuesta correcta y se corrige en la demo', async () => {
    const intento = await post<IntentoCreado>(`/api/cursos/${SLUG}/intentos`);
    expect(intento.preguntas.length).toBe(CURSOS_DEMO[SLUG].curso.numPreguntas);
    expect(JSON.stringify(intento)).not.toContain('"correcta"');
    const r = await post<Resultado>(`/api/intentos/${intento.intentoId}/entrega`, { respuestas: {} });
    expect(r.nota).toBe(0);
    expect(r.aprobado).toBe(false);
    await expect(post(`/api/intentos/${intento.intentoId}/pedido`, {})).rejects.toMatchObject({ status: 409 });
  });

  it('el pedido sobrevive a recargar la página (otra instancia) y el pago emite un diploma verificable', async () => {
    const intentoId = await aprobar();
    const pedido = await post<PedidoCreado>(`/api/intentos/${intentoId}/pedido`, {
      nombre: 'Ana',
      apellidos: 'Demo',
      dni: '12345678Z',
      email: 'ana@example.com',
      aceptaPrivacidad: true,
    });
    expect(pedido.urlPago).toContain(`pago-simulado/${pedido.pedidoId}`);

    nuevoCliente(); // la pasarela simulada recarga la página
    expect((await get<PedidoEstado>(`/api/pedidos/${pedido.pedidoId}`)).estado).toBe('PENDIENTE_PAGO');
    await post(`/api/pagos/simulado/${pedido.pedidoId}/confirmar`);
    const estado = await get<PedidoEstado>(`/api/pedidos/${pedido.pedidoId}`);
    expect(estado.estado).toBe('EMITIDO');
    expect(estado.codigoDiploma).toMatch(/^CO-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

    const v = await get<Verificacion>(`/api/verificar/${estado.codigoDiploma!.toLowerCase()}`);
    expect(v.valido).toBe(true);
    expect(v.titular).toBe('Ana Demo');
    expect(v.dniEnmascarado).toBe('***4567**');
    expect((await get<Verificacion>('/api/verificar/CO-ZZZZ-ZZZZ')).valido).toBe(false);
  });

  describe('panel de administración simulado', () => {
    const put = <T>(url: string, body: unknown) => firstValueFrom(http.put<T>(url, body));
    const del = (url: string) => firstValueFrom(http.delete(url));
    const entrar = () => post('/api/admin/login', { usuario: 'admin', password: 'admin' });

    it('sin sesión el panel responde 401 y con admin/admin se entra', async () => {
      await expect(get('/api/admin/yo')).rejects.toMatchObject({ status: 401 });
      await expect(post('/api/admin/login', { usuario: 'admin', password: 'mal' })).rejects.toMatchObject({ status: 401 });
      await entrar();
      expect(await get<{ usuario: string }>('/api/admin/yo')).toEqual({ usuario: 'admin' });
      await post('/api/admin/logout');
      await expect(get('/api/admin/cursos')).rejects.toMatchObject({ status: 401 });
    });

    it('crear, completar y publicar un curso lo muestra en la web y se puede examinar', async () => {
      await entrar();
      const curso = await post<{ id: number; slug: string; estado: string }>('/api/admin/cursos', { titulo: 'Primeros Auxilios' });
      expect(curso.slug).toBe('primeros-auxilios');
      expect(curso.estado).toBe('BORRADOR');
      expect((await get<{ slug: string }[]>('/api/cursos')).some((c) => c.slug === 'primeros-auxilios')).toBe(false);

      await expect(put(`/api/admin/cursos/${curso.id}/estado`, { estado: 'PUBLICADO' })).rejects.toMatchObject({
        status: 409,
        error: { error: 'Añade al menos un tema' },
      });

      await post(`/api/admin/cursos/${curso.id}/temas`, { titulo: 'Tema 1', contenido: '**Hola**' });
      for (const n of [1, 2]) {
        await post(`/api/admin/cursos/${curso.id}/preguntas`, { enunciado: `P${n}`, opciones: ['a', 'b'], correcta: 1 });
      }
      const actual = await get<Record<string, unknown>>(`/api/admin/cursos/${curso.id}`);
      await put(`/api/admin/cursos/${curso.id}`, { ...actual, numPreguntas: 2 });
      await put(`/api/admin/cursos/${curso.id}/estado`, { estado: 'PUBLICADO' });

      expect((await get<{ slug: string }[]>('/api/cursos')).some((c) => c.slug === 'primeros-auxilios')).toBe(true);
      expect((await get<{ titulo: string }>('/api/cursos/primeros-auxilios/temas/1')).titulo).toBe('Tema 1');
      const intento = await post<IntentoCreado>('/api/cursos/primeros-auxilios/intentos');
      const respuestas = Object.fromEntries(intento.preguntas.map((p) => [p.id, 1]));
      expect((await post<Resultado>(`/api/intentos/${intento.intentoId}/entrega`, { respuestas })).nota).toBe(100);

      const preguntas = await get<{ id: number }[]>(`/api/admin/cursos/${curso.id}/preguntas`);
      await expect(del(`/api/admin/cursos/${curso.id}/preguntas/${preguntas[0].id}`)).rejects.toMatchObject({ status: 409 });
    });

    it('dos cursos con el mismo título tienen direcciones distintas y los datos inválidos dan 400', async () => {
      await entrar();
      const a = await post<{ id: number; slug: string }>('/api/admin/cursos', { titulo: 'Legionella' });
      expect(a.slug).toBe('legionella-2');
      const actual = await get<Record<string, unknown>>(`/api/admin/cursos/${a.id}`);
      await expect(put(`/api/admin/cursos/${a.id}`, { ...actual, horas: 0 })).rejects.toMatchObject({
        status: 400,
        error: { campos: { horas: expect.any(String) } },
      });
    });

    it('la foto se guarda en el navegador y una que no es imagen se rechaza', async () => {
      await entrar();
      const datos = new FormData();
      datos.append('fichero', new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'f.png', { type: 'image/png' }));
      const c = await post<{ imagenUrl: string }>('/api/admin/cursos/1/imagen', datos);
      expect(c.imagenUrl).toMatch(/^data:image\/png;base64,/);
      expect((await get<{ imagenUrl: string }>('/api/cursos/manipulador-alimentos')).imagenUrl).toBe(c.imagenUrl);

      const malo = new FormData();
      malo.append('fichero', new File(['<html>'], 'x.jpg', { type: 'text/html' }));
      await expect(post('/api/admin/cursos/1/imagen', malo)).rejects.toMatchObject({ status: 400 });
    });

    it('reiniciar la demo vuelve a los datos de ejemplo', async () => {
      await entrar();
      await post('/api/admin/cursos', { titulo: 'Temporal' });
      reiniciarDemo();
      await entrar();
      const cursos = await get<{ titulo: string }[]>('/api/admin/cursos');
      expect(cursos.some((c) => c.titulo === 'Temporal')).toBe(false);
      expect(cursos.length).toBe(6);
    });
  });
});
