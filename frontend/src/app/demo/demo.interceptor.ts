import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, catchError, from, map, of, throwError } from 'rxjs';
import { CATALOGO_DEMO, CURSOS_DEMO } from './datos-demo';

/**
 * API simulada para la versión de demostración (GitHub Pages, sin servidor).
 * Responde en el navegador a las mismas rutas que el backend real —web pública y panel de
 * administración— y guarda los datos en localStorage, así que lo que se hace en el panel se ve en la
 * web y sobrevive a las recargas. «Reiniciar demo» vuelve a los datos de ejemplo.
 */

type Estado = 'BORRADOR' | 'PROXIMAMENTE' | 'PUBLICADO';

interface CursoBd {
  id: number;
  slug: string;
  titulo: string;
  resumen: string;
  descripcion: string;
  horas: number;
  precioCentimos: number;
  notaMinima: number;
  numPreguntas: number;
  orden: number;
  estado: Estado;
  imagenUrl: string | null;
}
interface TemaBd { id: number; cursoId: number; orden: number; titulo: string; contenido: string }
interface PreguntaBd { id: number; cursoId: number; enunciado: string; opciones: string[]; correcta: number; activa: boolean }
interface IntentoBd { cursoId: number; preguntaIds: number[]; entregado: boolean; aprobado: boolean }
interface PedidoBd {
  intentoId: string;
  nombre: string;
  apellidos: string;
  dni: string;
  estado: 'PENDIENTE_PAGO' | 'EMITIDO';
  codigo?: string;
  emitidoEn?: string;
}
interface Bd {
  cursos: CursoBd[];
  temas: TemaBd[];
  preguntas: PreguntaBd[];
  intentos: Record<string, IntentoBd>;
  pedidos: Record<string, PedidoBd>;
  seq: number;
  sesion: boolean;
}

// Clave propia por proyecto: varias demos en el mismo dominio (github.io) comparten localStorage.
const CLAVE = 'aula-online.demo.bd';
const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const MAX_IMAGEN = 1024 * 1024; // el navegador guarda poco: 1 MB en la demo (5 MB en el servidor real)
export const USUARIO_DEMO = 'admin';
export const PASSWORD_DEMO = 'admin';

class ErrorApi {
  constructor(
    readonly status: number,
    readonly mensaje: string,
    readonly campos: Record<string, string> = {},
  ) {}
}

// ---------- base de datos en localStorage ----------

function inicial(): Bd {
  const cursos: CursoBd[] = [];
  const temas: TemaBd[] = [];
  const preguntas: PreguntaBd[] = [];
  let seq = 1000;
  CATALOGO_DEMO.forEach((c, i) => {
    const completo = CURSOS_DEMO[c.slug];
    const id = i + 1;
    cursos.push({
      id,
      slug: c.slug,
      titulo: c.titulo,
      resumen: c.resumen ?? '',
      descripcion: completo?.curso.descripcion ?? c.resumen ?? '',
      horas: c.horas,
      precioCentimos: c.precioCentimos,
      notaMinima: completo?.curso.notaMinima ?? 75,
      numPreguntas: completo?.curso.numPreguntas ?? 20,
      orden: (i + 1) * 10,
      estado: c.estado,
      imagenUrl: c.imagenUrl,
    });
    completo?.temas.forEach((t) => temas.push({ id: ++seq, cursoId: id, orden: t.orden, titulo: t.titulo, contenido: t.contenido }));
    // Las preguntas conservan sus ids originales (pequeños); los nuevos empiezan en 1000.
    completo?.preguntas.forEach((p) => preguntas.push({ ...p, cursoId: id, activa: true }));
  });
  return { cursos, temas, preguntas, intentos: {}, pedidos: {}, seq, sesion: false };
}

function leer(): Bd {
  try {
    const s = localStorage.getItem(CLAVE);
    if (s) return JSON.parse(s) as Bd;
  } catch {
    // sin almacenamiento o datos corruptos: se empieza de cero
  }
  return inicial();
}

function guardar(bd: Bd): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(bd));
  } catch {
    throw new ErrorApi(400, 'El navegador no tiene espacio para guardar más datos de la demo. Prueba a reiniciarla.');
  }
}

export function reiniciarDemo(): void {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // nada que borrar
  }
}

// ---------- utilidades ----------

const id = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());
const bloque = () => Array.from({ length: 4 }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');
const normalizarCodigo = (c: string) => {
  const l = c.trim().toUpperCase().replace(/[\s-]+/g, '');
  return /^[A-Z]{2}.{8}$/.test(l) ? `${l.slice(0, 2)}-${l.slice(2, 6)}-${l.slice(6)}` : l;
};
const enmascarar = (dni: string) => (dni.length === 9 ? `***${dni.slice(3, 7)}**` : '*********');

function barajar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function slugDesde(titulo: string): string {
  const s = titulo
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
    .replace(/-+$/, '');
  return s || 'curso';
}

const temasDe = (bd: Bd, cursoId: number) => bd.temas.filter((t) => t.cursoId === cursoId).sort((a, b) => a.orden - b.orden);
const activasDe = (bd: Bd, cursoId: number) => bd.preguntas.filter((p) => p.cursoId === cursoId && p.activa);

/** Mismas condiciones que el servidor para que un curso esté publicado. */
function verificarPublicable(c: CursoBd, temas: number, activas: number): void {
  if (temas < 1) throw new ErrorApi(409, 'Añade al menos un tema');
  if (c.numPreguntas < 1) throw new ErrorApi(409, 'El examen debe tener al menos una pregunta');
  if (activas < c.numPreguntas) throw new ErrorApi(409, `Hay ${activas} preguntas activas y el examen usa ${c.numPreguntas}`);
}

function curso(bd: Bd, cursoId: number): CursoBd {
  const c = bd.cursos.find((x) => x.id === cursoId);
  if (!c) throw new ErrorApi(404, 'Curso no encontrado');
  return c;
}

const cursoPublicado = (bd: Bd, slug: string) => {
  const c = bd.cursos.find((x) => x.slug === slug && x.estado === 'PUBLICADO');
  if (!c) throw new ErrorApi(404, 'Curso no encontrado');
  return c;
};

const resumenAdmin = (bd: Bd, c: CursoBd) => ({
  id: c.id,
  slug: c.slug,
  titulo: c.titulo,
  estado: c.estado,
  temas: temasDe(bd, c.id).length,
  preguntasActivas: activasDe(bd, c.id).length,
  precioCentimos: c.precioCentimos,
  imagenUrl: c.imagenUrl,
});

const preguntaAdmin = ({ id: pid, enunciado, opciones, correcta, activa }: PreguntaBd) => ({ id: pid, enunciado, opciones, correcta, activa });
const temaAdmin = ({ id: tid, orden, titulo, contenido }: TemaBd) => ({ id: tid, orden, titulo, contenido });

// ---------- validaciones (mismos límites que el servidor) ----------

type Cuerpo = Record<string, unknown>;

function texto(c: Cuerpo, campo: string, min: number, max: number, errores: Record<string, string>): string {
  const v = c[campo];
  if (typeof v !== 'string' || v.trim().length < min) errores[campo] = 'Es obligatorio';
  else if (v.length > max) errores[campo] = `Máximo ${max} caracteres`;
  return typeof v === 'string' ? v.trim() : '';
}

function numero(c: Cuerpo, campo: string, min: number, max: number, errores: Record<string, string>): number {
  const v = Number(c[campo]);
  if (!Number.isInteger(v) || v < min || v > max) errores[campo] = `Debe estar entre ${min} y ${max}`;
  return v;
}

function validarDatosCurso(c: Cuerpo) {
  const e: Record<string, string> = {};
  const datos = {
    titulo: texto(c, 'titulo', 1, 200, e),
    slug: texto(c, 'slug', 1, 100, e),
    resumen: typeof c['resumen'] === 'string' ? (c['resumen'] as string).trim() : '',
    descripcion: typeof c['descripcion'] === 'string' ? (c['descripcion'] as string) : '',
    horas: numero(c, 'horas', 1, 1000, e),
    precioCentimos: numero(c, 'precioCentimos', 0, 100000, e),
    notaMinima: numero(c, 'notaMinima', 1, 100, e),
    numPreguntas: numero(c, 'numPreguntas', 1, 200, e),
    orden: numero(c, 'orden', 0, 9999, e),
  };
  if (!e['slug'] && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(datos.slug)) e['slug'] = 'Solo minúsculas, números y guiones';
  if (datos.resumen.length > 200) e['resumen'] = 'Máximo 200 caracteres';
  if (typeof c['descripcion'] !== 'string') e['descripcion'] = 'Es obligatoria';
  else if (datos.descripcion.length > 4000) e['descripcion'] = 'Máximo 4000 caracteres';
  if (Object.keys(e).length) throw new ErrorApi(400, 'Datos no válidos', e);
  return datos;
}

function validarTema(c: Cuerpo) {
  const e: Record<string, string> = {};
  const datos = { titulo: texto(c, 'titulo', 1, 200, e), contenido: texto(c, 'contenido', 1, 20000, e) };
  if (Object.keys(e).length) throw new ErrorApi(400, 'Datos no válidos', e);
  return datos;
}

function validarPregunta(c: Cuerpo) {
  const e: Record<string, string> = {};
  const enunciado = texto(c, 'enunciado', 1, 1000, e);
  const opciones = Array.isArray(c['opciones']) ? (c['opciones'] as unknown[]) : [];
  if (opciones.length < 2 || opciones.length > 6) e['opciones'] = 'Entre 2 y 6 opciones';
  else if (opciones.some((o) => typeof o !== 'string' || !o.trim() || o.length > 500)) e['opciones'] = 'Las opciones no pueden estar vacías';
  if (Object.keys(e).length) throw new ErrorApi(400, 'Datos no válidos', e);
  const correcta = Number(c['correcta']);
  if (!Number.isInteger(correcta) || correcta < 0 || correcta >= opciones.length) {
    throw new ErrorApi(400, 'La respuesta correcta no es una de las opciones');
  }
  return { enunciado, opciones: (opciones as string[]).map((o) => o.trim()), correcta };
}

// ---------- imágenes ----------

const FIRMAS: [string, number[]][] = [
  ['image/jpeg', [0xff, 0xd8, 0xff]],
  ['image/png', [0x89, 0x50, 0x4e, 0x47]],
];

function leerImagen(fichero: File): Promise<string> {
  if (fichero.size > MAX_IMAGEN) return Promise.reject(new ErrorApi(400, 'En la demo la imagen no puede superar 1 MB'));
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onerror = () => rechazar(new ErrorApi(400, 'No se pudo leer la imagen'));
    lector.onload = () => {
      const url = String(lector.result);
      const bytes = Uint8Array.from(atob(url.slice(url.indexOf(',') + 1, url.indexOf(',') + 25)), (ch) => ch.charCodeAt(0));
      const esWebp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
      const tipo = esWebp ? 'image/webp' : FIRMAS.find(([, f]) => f.every((b, i) => bytes[i] === b))?.[0];
      if (!tipo) rechazar(new ErrorApi(400, 'Formato de imagen no válido (solo JPG, PNG o WebP)'));
      else resolver(`data:${tipo};base64,${url.slice(url.indexOf(',') + 1)}`);
    };
    lector.readAsDataURL(fichero);
  });
}

// ---------- rutas ----------

function publica(bd: Bd, req: HttpRequest<unknown>, url: string): { status?: number; body: unknown } {
  const r = (patron: RegExp) => url.match(patron);
  let m: RegExpMatchArray | null;
  const b = (req.body ?? {}) as Cuerpo;

  if (req.method === 'GET' && url === '/api/cursos') {
    return {
      body: bd.cursos
        .filter((c) => c.estado !== 'BORRADOR')
        .sort((a, c) => a.orden - c.orden || a.titulo.localeCompare(c.titulo))
        .map(({ slug, titulo, resumen, horas, precioCentimos, estado, imagenUrl }) => ({ slug, titulo, resumen, horas, precioCentimos, estado, imagenUrl })),
    };
  }

  if (req.method === 'GET' && (m = r(/^\/api\/cursos\/([^/]+)$/))) {
    const c = cursoPublicado(bd, decodeURIComponent(m[1]));
    const { id: _id, orden: _o, estado: _e, ...publico } = c;
    return { body: { ...publico, temas: temasDe(bd, c.id).map((t) => ({ orden: t.orden, titulo: t.titulo })) } };
  }

  if (req.method === 'GET' && (m = r(/^\/api\/cursos\/([^/]+)\/temas\/(\d+)$/))) {
    const c = cursoPublicado(bd, decodeURIComponent(m[1]));
    const t = temasDe(bd, c.id).find((x) => x.orden === Number(m![2]));
    if (!t) throw new ErrorApi(404, 'Tema no encontrado');
    return { body: { orden: t.orden, titulo: t.titulo, contenido: t.contenido } };
  }

  if (req.method === 'POST' && (m = r(/^\/api\/cursos\/([^/]+)\/intentos$/))) {
    const c = cursoPublicado(bd, decodeURIComponent(m[1]));
    const elegidas = barajar(activasDe(bd, c.id)).slice(0, c.numPreguntas);
    const intentoId = id();
    bd.intentos[intentoId] = { cursoId: c.id, preguntaIds: elegidas.map((p) => p.id), entregado: false, aprobado: false };
    guardar(bd);
    return { status: 201, body: { intentoId, preguntas: elegidas.map(({ id: pid, enunciado, opciones }) => ({ id: pid, enunciado, opciones })) } };
  }

  if ((m = r(/^\/api\/intentos\/([^/]+)\/(entrega|curso|pedido)$/))) {
    const intentoId = decodeURIComponent(m[1]);
    const intento = bd.intentos[intentoId];
    if (!intento) throw new ErrorApi(404, 'Intento no encontrado');
    const c = curso(bd, intento.cursoId);

    if (m[2] === 'curso' && req.method === 'GET') return { body: { slug: c.slug, titulo: c.titulo, precioCentimos: c.precioCentimos } };

    if (m[2] === 'entrega' && req.method === 'POST') {
      if (intento.entregado) throw new ErrorApi(409, 'Este examen ya se ha entregado');
      const respuestas = (b['respuestas'] ?? {}) as Record<string, number>;
      const aciertos = intento.preguntaIds.filter(
        (pid) => respuestas[pid] !== undefined && bd.preguntas.find((p) => p.id === pid)?.correcta === Number(respuestas[pid]),
      ).length;
      const total = intento.preguntaIds.length;
      const nota = total ? Math.round((aciertos * 100) / total) : 0;
      intento.entregado = true;
      intento.aprobado = nota >= c.notaMinima;
      guardar(bd);
      return { body: { nota, aprobado: intento.aprobado, notaMinima: c.notaMinima, aciertos, total } };
    }

    if (m[2] === 'pedido' && req.method === 'POST') {
      if (!intento.entregado || !intento.aprobado) throw new ErrorApi(409, 'El examen no está aprobado');
      const e: Record<string, string> = {};
      const nombre = texto(b, 'nombre', 1, 100, e);
      const apellidos = texto(b, 'apellidos', 1, 150, e);
      const dni = texto(b, 'dni', 1, 20, e).replace(/[\s-]/g, '').toUpperCase();
      texto(b, 'email', 3, 254, e);
      if (b['aceptaPrivacidad'] !== true) e['aceptaPrivacidad'] = 'Debes aceptar la política de privacidad';
      if (Object.keys(e).length) throw new ErrorApi(400, 'Datos no válidos', e);
      const pedidoId = id();
      bd.pedidos[pedidoId] = { intentoId, nombre, apellidos, dni, estado: 'PENDIENTE_PAGO' };
      guardar(bd);
      return { status: 201, body: { pedidoId, urlPago: new URL(`pago-simulado/${pedidoId}`, document.baseURI).href } };
    }
  }

  if (req.method === 'GET' && (m = r(/^\/api\/pedidos\/([^/]+)$/))) {
    const pedidoId = decodeURIComponent(m[1]);
    const p = bd.pedidos[pedidoId];
    if (!p) throw new ErrorApi(404, 'Pedido no encontrado');
    const c = curso(bd, bd.intentos[p.intentoId].cursoId);
    return {
      body: {
        pedidoId,
        estado: p.estado,
        importeCentimos: c.precioCentimos,
        ...(p.estado === 'EMITIDO' ? { codigoDiploma: p.codigo, tokenDescarga: 'demo' } : {}),
      },
    };
  }

  if (req.method === 'POST' && (m = r(/^\/api\/pagos\/simulado\/([^/]+)\/confirmar$/))) {
    const p = bd.pedidos[decodeURIComponent(m[1])];
    if (!p) throw new ErrorApi(404, 'Pedido no encontrado');
    if (p.estado !== 'EMITIDO') {
      p.estado = 'EMITIDO';
      p.codigo = `CO-${bloque()}-${bloque()}`;
      p.emitidoEn = new Date().toISOString().slice(0, 10);
      guardar(bd);
    }
    return { status: 204, body: null };
  }

  if (req.method === 'GET' && (m = r(/^\/api\/verificar\/(.+)$/))) {
    const codigo = normalizarCodigo(decodeURIComponent(m[1]));
    const p = Object.values(bd.pedidos).find((x) => x.codigo === codigo);
    if (!p) return { body: { valido: false } };
    const c = curso(bd, bd.intentos[p.intentoId].cursoId);
    return {
      body: { valido: true, codigo, titular: `${p.nombre} ${p.apellidos}`, dniEnmascarado: enmascarar(p.dni), curso: c.titulo, horas: c.horas, fechaEmision: p.emitidoEn },
    };
  }

  throw new ErrorApi(404, 'No disponible en la demo');
}

function admin(bd: Bd, req: HttpRequest<unknown>, url: string): { status?: number; body: unknown } | Promise<{ body: unknown }> {
  const ruta = url.slice('/api/admin'.length);
  const b = (req.body ?? {}) as Cuerpo;
  const r = (patron: RegExp) => ruta.match(patron);
  let m: RegExpMatchArray | null;

  if (ruta === '/csrf') return { status: 204, body: null };
  if (ruta === '/login' && req.method === 'POST') {
    if (b['usuario'] !== USUARIO_DEMO || b['password'] !== PASSWORD_DEMO) throw new ErrorApi(401, 'Usuario o contraseña incorrectos');
    bd.sesion = true;
    guardar(bd);
    return { status: 204, body: null };
  }
  if (!bd.sesion) throw new ErrorApi(401, 'Inicia sesión');
  if (ruta === '/logout' && req.method === 'POST') {
    bd.sesion = false;
    guardar(bd);
    return { status: 204, body: null };
  }
  if (ruta === '/yo') return { body: { usuario: USUARIO_DEMO } };

  if (ruta === '/cursos' && req.method === 'GET') {
    return { body: [...bd.cursos].sort((a, c) => a.orden - c.orden || a.titulo.localeCompare(c.titulo)).map((c) => resumenAdmin(bd, c)) };
  }

  if (ruta === '/cursos' && req.method === 'POST') {
    const e: Record<string, string> = {};
    const titulo = texto(b, 'titulo', 1, 200, e);
    if (Object.keys(e).length) throw new ErrorApi(400, 'Datos no válidos', e);
    const base = slugDesde(titulo);
    let slug = base;
    for (let n = 2; bd.cursos.some((c) => c.slug === slug); n++) slug = `${base}-${n}`;
    const c: CursoBd = {
      id: ++bd.seq, slug, titulo, resumen: '', descripcion: '', horas: 10, precioCentimos: 1990,
      notaMinima: 75, numPreguntas: 20, orden: 100, estado: 'BORRADOR', imagenUrl: null,
    };
    bd.cursos.push(c);
    guardar(bd);
    return { status: 201, body: c };
  }

  if ((m = r(/^\/cursos\/(\d+)$/))) {
    const c = curso(bd, Number(m[1]));
    if (req.method === 'GET') return { body: c };
    if (req.method === 'PUT') {
      const d = validarDatosCurso(b);
      if (d.slug !== c.slug) {
        if (c.estado !== 'BORRADOR') throw new ErrorApi(409, 'La dirección solo se puede cambiar en Borrador');
        if (bd.cursos.some((x) => x.slug === d.slug)) throw new ErrorApi(409, 'Ya existe un curso con esa dirección');
      }
      const nuevo = { ...c, ...d };
      if (nuevo.estado === 'PUBLICADO') verificarPublicable(nuevo, temasDe(bd, c.id).length, activasDe(bd, c.id).length);
      Object.assign(c, d);
      guardar(bd);
      return { body: c };
    }
  }

  if ((m = r(/^\/cursos\/(\d+)\/estado$/)) && req.method === 'PUT') {
    const c = curso(bd, Number(m[1]));
    const estado = b['estado'] as Estado;
    if (!['BORRADOR', 'PROXIMAMENTE', 'PUBLICADO'].includes(estado)) throw new ErrorApi(400, 'Estado no válido');
    if (estado === 'PUBLICADO') verificarPublicable(c, temasDe(bd, c.id).length, activasDe(bd, c.id).length);
    c.estado = estado;
    guardar(bd);
    return { body: c };
  }

  if ((m = r(/^\/cursos\/(\d+)\/imagen$/))) {
    const c = curso(bd, Number(m[1]));
    if (req.method === 'DELETE') {
      c.imagenUrl = null;
      guardar(bd);
      return { body: c };
    }
    if (req.method === 'POST') {
      const fichero = req.body instanceof FormData ? req.body.get('fichero') : null;
      if (!(fichero instanceof File)) throw new ErrorApi(400, 'Falta la imagen');
      return leerImagen(fichero).then((datos) => {
        const bd2 = leer();
        const c2 = curso(bd2, c.id);
        c2.imagenUrl = datos;
        guardar(bd2);
        return { body: c2 };
      });
    }
  }

  if ((m = r(/^\/cursos\/(\d+)\/temas(?:\/(orden|\d+))?$/))) {
    const c = curso(bd, Number(m[1]));
    const temas = temasDe(bd, c.id);
    if (!m[2] && req.method === 'GET') return { body: temas.map(temaAdmin) };
    if (!m[2] && req.method === 'POST') {
      const d = validarTema(b);
      const t: TemaBd = { id: ++bd.seq, cursoId: c.id, orden: temas.length + 1, ...d };
      bd.temas.push(t);
      guardar(bd);
      return { status: 201, body: temaAdmin(t) };
    }
    if (m[2] === 'orden' && req.method === 'PUT') {
      const ids = (b['ids'] ?? []) as number[];
      const actuales = temas.map((t) => t.id);
      if (ids.length !== actuales.length || new Set(ids).size !== ids.length || !ids.every((x) => actuales.includes(x))) {
        throw new ErrorApi(400, 'La lista de temas no coincide con los del curso');
      }
      ids.forEach((tid, i) => (bd.temas.find((t) => t.id === tid)!.orden = i + 1));
      guardar(bd);
      return { body: temasDe(bd, c.id).map(temaAdmin) };
    }
    const tema = temas.find((t) => t.id === Number(m![2]));
    if (!tema) throw new ErrorApi(404, 'Tema no encontrado');
    if (req.method === 'PUT') {
      Object.assign(tema, validarTema(b));
      guardar(bd);
      return { body: temaAdmin(tema) };
    }
    if (req.method === 'DELETE') {
      if (c.estado === 'PUBLICADO') verificarPublicable(c, temas.length - 1, activasDe(bd, c.id).length);
      bd.temas = bd.temas.filter((t) => t.id !== tema.id);
      temasDe(bd, c.id).forEach((t, i) => (t.orden = i + 1));
      guardar(bd);
      return { status: 204, body: null };
    }
  }

  if ((m = r(/^\/cursos\/(\d+)\/preguntas(?:\/(\d+))?$/))) {
    const c = curso(bd, Number(m[1]));
    if (!m[2] && req.method === 'GET') {
      const lista = bd.preguntas.filter((p) => p.cursoId === c.id).sort((a, p) => Number(p.activa) - Number(a.activa) || a.id - p.id);
      return { body: lista.map(preguntaAdmin) };
    }
    if (!m[2] && req.method === 'POST') {
      const p: PreguntaBd = { id: ++bd.seq, cursoId: c.id, activa: true, ...validarPregunta(b) };
      bd.preguntas.push(p);
      guardar(bd);
      return { status: 201, body: preguntaAdmin(p) };
    }
    const p = bd.preguntas.find((x) => x.id === Number(m![2]) && x.cursoId === c.id);
    if (!p) throw new ErrorApi(404, 'Pregunta no encontrada');
    if (req.method === 'PUT') {
      Object.assign(p, validarPregunta(b));
      guardar(bd);
      return { body: preguntaAdmin(p) };
    }
    if (req.method === 'DELETE') {
      if (p.activa && c.estado === 'PUBLICADO') verificarPublicable(c, temasDe(bd, c.id).length, activasDe(bd, c.id).length - 1);
      p.activa = false;
      guardar(bd);
      return { status: 204, body: null };
    }
  }

  throw new ErrorApi(404, 'No disponible en la demo');
}

function aRespuesta(url: string, r: { status?: number; body: unknown }): HttpResponse<unknown> {
  return new HttpResponse({ status: r.status ?? 200, body: r.body, url });
}

function aError(url: string, e: unknown): Observable<never> {
  const err = e instanceof ErrorApi ? e : new ErrorApi(500, 'Error en la demo');
  return throwError(() => new HttpErrorResponse({ status: err.status, error: { error: err.mensaje, campos: err.campos }, url }));
}

export const demoInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);
  const url = req.url.split('?')[0];
  try {
    const bd = leer();
    const r = url.startsWith('/api/admin') ? admin(bd, req, url) : publica(bd, req, url);
    if (r instanceof Promise) {
      return from(r).pipe(
        map((x) => aRespuesta(url, x)),
        catchError((e) => aError(url, e)),
      );
    }
    return of(aRespuesta(url, r));
  } catch (e) {
    return aError(url, e);
  }
};
