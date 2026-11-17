import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CursoAdmin,
  CursoAdminResumen,
  DatosCurso,
  DatosPregunta,
  DatosTema,
  EstadoCurso,
  PreguntaAdmin,
  TemaAdmin,
} from './modelos-admin';

const BASE = '/api/admin';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);

  csrf(): Observable<void> {
    return this.http.get<void>(`${BASE}/csrf`);
  }
  login(usuario: string, password: string): Observable<void> {
    return this.http.post<void>(`${BASE}/login`, { usuario, password });
  }
  logout(): Observable<void> {
    return this.http.post<void>(`${BASE}/logout`, {});
  }
  yo(): Observable<{ usuario: string }> {
    return this.http.get<{ usuario: string }>(`${BASE}/yo`);
  }

  cursos(): Observable<CursoAdminResumen[]> {
    return this.http.get<CursoAdminResumen[]>(`${BASE}/cursos`);
  }
  crearCurso(titulo: string): Observable<CursoAdmin> {
    return this.http.post<CursoAdmin>(`${BASE}/cursos`, { titulo });
  }
  curso(id: number): Observable<CursoAdmin> {
    return this.http.get<CursoAdmin>(`${BASE}/cursos/${id}`);
  }
  guardarCurso(id: number, datos: DatosCurso): Observable<CursoAdmin> {
    return this.http.put<CursoAdmin>(`${BASE}/cursos/${id}`, datos);
  }
  cambiarEstado(id: number, estado: EstadoCurso): Observable<CursoAdmin> {
    return this.http.put<CursoAdmin>(`${BASE}/cursos/${id}/estado`, { estado });
  }
  subirImagen(id: number, fichero: File): Observable<CursoAdmin> {
    const datos = new FormData();
    datos.append('fichero', fichero);
    return this.http.post<CursoAdmin>(`${BASE}/cursos/${id}/imagen`, datos);
  }
  quitarImagen(id: number): Observable<CursoAdmin> {
    return this.http.delete<CursoAdmin>(`${BASE}/cursos/${id}/imagen`);
  }

  temas(id: number): Observable<TemaAdmin[]> {
    return this.http.get<TemaAdmin[]>(`${BASE}/cursos/${id}/temas`);
  }
  crearTema(id: number, datos: DatosTema): Observable<TemaAdmin> {
    return this.http.post<TemaAdmin>(`${BASE}/cursos/${id}/temas`, datos);
  }
  guardarTema(id: number, temaId: number, datos: DatosTema): Observable<TemaAdmin> {
    return this.http.put<TemaAdmin>(`${BASE}/cursos/${id}/temas/${temaId}`, datos);
  }
  borrarTema(id: number, temaId: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/cursos/${id}/temas/${temaId}`);
  }
  ordenarTemas(id: number, ids: number[]): Observable<TemaAdmin[]> {
    return this.http.put<TemaAdmin[]>(`${BASE}/cursos/${id}/temas/orden`, { ids });
  }

  preguntas(id: number): Observable<PreguntaAdmin[]> {
    return this.http.get<PreguntaAdmin[]>(`${BASE}/cursos/${id}/preguntas`);
  }
  crearPregunta(id: number, datos: DatosPregunta): Observable<PreguntaAdmin> {
    return this.http.post<PreguntaAdmin>(`${BASE}/cursos/${id}/preguntas`, datos);
  }
  guardarPregunta(id: number, preguntaId: number, datos: DatosPregunta): Observable<PreguntaAdmin> {
    return this.http.put<PreguntaAdmin>(`${BASE}/cursos/${id}/preguntas/${preguntaId}`, datos);
  }
  borrarPregunta(id: number, preguntaId: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/cursos/${id}/preguntas/${preguntaId}`);
  }
}
