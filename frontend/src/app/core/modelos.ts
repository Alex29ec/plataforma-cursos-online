// Interfaces que reflejan los DTOs del backend.

export type EstadoCursoPublico = 'PUBLICADO' | 'PROXIMAMENTE';

/** Tarjeta del catálogo público (GET /api/cursos). */
export interface CursoCatalogo {
  slug: string;
  titulo: string;
  resumen: string;
  horas: number;
  precioCentimos: number;
  estado: EstadoCursoPublico;
  imagenUrl: string | null;
}

/** Curso al que pertenece un intento (GET /api/intentos/{id}/curso). */
export interface CursoResumen {
  slug: string;
  titulo: string;
  precioCentimos: number;
}

export interface TemaResumen {
  orden: number;
  titulo: string;
}

export interface Curso {
  slug: string;
  titulo: string;
  descripcion: string;
  resumen: string;
  imagenUrl: string | null;
  horas: number;
  precioCentimos: number;
  notaMinima: number;
  numPreguntas: number;
  temas: TemaResumen[];
}

export interface Tema {
  orden: number;
  titulo: string;
  contenido: string;
}

export interface PreguntaExamen {
  id: number;
  enunciado: string;
  opciones: string[];
}

export interface IntentoCreado {
  intentoId: string;
  preguntas: PreguntaExamen[];
}

export interface Resultado {
  nota: number;
  aprobado: boolean;
  notaMinima: number;
  aciertos: number;
  total: number;
}

export interface DatosAlumno {
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  aceptaPrivacidad: boolean;
}

export interface PedidoCreado {
  pedidoId: string;
  urlPago: string;
}

export type EstadoPedido = 'PENDIENTE_PAGO' | 'PAGADO' | 'EMITIDO' | 'CANCELADO';

export interface PedidoEstado {
  pedidoId: string;
  estado: EstadoPedido;
  importeCentimos: number;
  codigoDiploma?: string;
  tokenDescarga?: string;
}

export interface Verificacion {
  valido: boolean;
  codigo?: string;
  titular?: string;
  dniEnmascarado?: string;
  curso?: string;
  horas?: number;
  fechaEmision?: string;
}

/** Errores del backend: { error, campos }. */
export interface ErrorApi {
  error: string;
  campos: Record<string, string>;
}

export function formatearPrecio(centimos: number): string {
  return (centimos / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}
