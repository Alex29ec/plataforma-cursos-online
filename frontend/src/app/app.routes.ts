import { Routes } from '@angular/router';

/** Curso al que apuntan las rutas antiguas de la web de un solo curso. */
const CURSO_ANTIGUO = 'manipulador-alimentos';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Aula Online | Formación profesional online',
    loadComponent: () => import('./paginas/portada/portada').then((m) => m.Portada),
  },
  { path: 'cursos/:slug', loadComponent: () => import('./paginas/curso/curso').then((m) => m.CursoPagina) },
  { path: 'cursos/:slug/temario', title: 'Temario | Aula Online', loadComponent: () => import('./paginas/curso/indice').then((m) => m.Indice) },
  { path: 'cursos/:slug/tema/:orden', title: 'Tema | Aula Online', loadComponent: () => import('./paginas/curso/tema').then((m) => m.TemaPagina) },
  { path: 'cursos/:slug/examen', title: 'Examen | Aula Online', loadComponent: () => import('./paginas/examen/examen').then((m) => m.Examen) },
  // Compatibilidad con los enlaces de la web anterior (un solo curso).
  { path: 'curso', pathMatch: 'full', redirectTo: `cursos/${CURSO_ANTIGUO}` },
  { path: 'curso/tema/:orden', redirectTo: `cursos/${CURSO_ANTIGUO}/tema/:orden` },
  { path: 'examen', pathMatch: 'full', redirectTo: `cursos/${CURSO_ANTIGUO}/examen` },
  { path: 'resultado', title: 'Resultado | Aula Online', loadComponent: () => import('./paginas/resultado/resultado').then((m) => m.ResultadoPagina) },
  { path: 'intento/:intentoId/datos', title: 'Tus datos | Aula Online', loadComponent: () => import('./paginas/datos-alumno/datos-alumno').then((m) => m.DatosAlumnoPagina) },
  { path: 'pago-simulado/:pedidoId', title: 'Pago (demo) | Aula Online', loadComponent: () => import('./paginas/pago-simulado/pago-simulado').then((m) => m.PagoSimulado) },
  { path: 'pedido/:pedidoId', title: 'Tu diploma | Aula Online', loadComponent: () => import('./paginas/pedido/pedido').then((m) => m.PedidoPagina) },
  { path: 'pedido/:pedidoId/datos', title: 'Tus datos | Aula Online', loadComponent: () => import('./paginas/pedido/reanudar-pago').then((m) => m.ReanudarPago) },
  { path: 'verificar', title: 'Verificar diploma | Aula Online', loadComponent: () => import('./paginas/verificar/verificar').then((m) => m.VerificarPagina) },
  { path: 'verificar/:codigo', title: 'Verificar diploma | Aula Online', loadComponent: () => import('./paginas/verificar/verificar').then((m) => m.VerificarPagina) },
  { path: 'privacidad', title: 'Política de privacidad | Aula Online', loadComponent: () => import('./paginas/legal/privacidad').then((m) => m.Privacidad) },
  { path: 'aviso-legal', title: 'Aviso legal | Aula Online', loadComponent: () => import('./paginas/legal/aviso-legal').then((m) => m.AvisoLegal) },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes) },
  { path: '**', redirectTo: '' },
];
