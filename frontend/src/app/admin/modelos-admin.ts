// Tipos que reflejan los DTOs de /api/admin.

export type EstadoCurso = 'BORRADOR' | 'PROXIMAMENTE' | 'PUBLICADO';

export interface CursoAdminResumen {
  id: number;
  slug: string;
  titulo: string;
  estado: EstadoCurso;
  temas: number;
  preguntasActivas: number;
  precioCentimos: number;
  imagenUrl: string | null;
}

export interface CursoAdmin {
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
  estado: EstadoCurso;
  imagenUrl: string | null;
}

export type DatosCurso = Omit<CursoAdmin, 'id' | 'estado' | 'imagenUrl'>;

export interface TemaAdmin {
  id: number;
  orden: number;
  titulo: string;
  contenido: string;
}

export interface DatosTema {
  titulo: string;
  contenido: string;
}

export interface PreguntaAdmin {
  id: number;
  enunciado: string;
  opciones: string[];
  correcta: number;
  activa: boolean;
}

export interface DatosPregunta {
  enunciado: string;
  opciones: string[];
  correcta: number;
}

export const ETIQUETA_ESTADO: Record<EstadoCurso, string> = {
  BORRADOR: 'Borrador',
  PROXIMAMENTE: 'Próximamente',
  PUBLICADO: 'Publicado',
};
