import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ENTORNO } from './entorno';
import {
  Curso,
  CursoCatalogo,
  CursoResumen,
  DatosAlumno,
  IntentoCreado,
  PedidoCreado,
  PedidoEstado,
  Resultado,
  Tema,
  Verificacion,
} from './modelos';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  catalogo(): Observable<CursoCatalogo[]> {
    return this.http.get<CursoCatalogo[]>(`/api/cursos`);
  }

  curso(slug: string): Observable<Curso> {
    return this.http.get<Curso>(`/api/cursos/${enc(slug)}`);
  }

  tema(slug: string, orden: number): Observable<Tema> {
    return this.http.get<Tema>(`/api/cursos/${enc(slug)}/temas/${orden}`);
  }

  crearIntento(slug: string): Observable<IntentoCreado> {
    return this.http.post<IntentoCreado>(`/api/cursos/${enc(slug)}/intentos`, null);
  }

  entregar(intentoId: string, respuestas: Record<number, number>): Observable<Resultado> {
    return this.http.post<Resultado>(`/api/intentos/${enc(intentoId)}/entrega`, { respuestas });
  }

  crearPedido(intentoId: string, datos: DatosAlumno): Observable<PedidoCreado> {
    return this.http.post<PedidoCreado>(`/api/intentos/${enc(intentoId)}/pedido`, datos);
  }

  cursoDeIntento(intentoId: string): Observable<CursoResumen> {
    return this.http.get<CursoResumen>(`/api/intentos/${enc(intentoId)}/curso`);
  }

  pedido(pedidoId: string): Observable<PedidoEstado> {
    return this.http.get<PedidoEstado>(`/api/pedidos/${enc(pedidoId)}`);
  }

  confirmarPagoSimulado(pedidoId: string): Observable<void> {
    return this.http.post<void>(`/api/pagos/simulado/${enc(pedidoId)}/confirmar`, null);
  }

  verificar(codigo: string): Observable<Verificacion> {
    return this.http.get<Verificacion>(`/api/verificar/${enc(codigo)}`);
  }

  urlDescarga(codigo: string, token: string): string {
    // En la demo no hay servidor que genere el PDF: se descarga un diploma de ejemplo.
    if (ENTORNO.demo) return 'demo/diploma-ejemplo.pdf';
    return `/api/diplomas/${enc(codigo)}/pdf?token=${enc(token)}`;
  }
}

function enc(valor: string): string {
  return encodeURIComponent(valor);
}
