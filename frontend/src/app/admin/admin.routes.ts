import { Routes } from '@angular/router';
import { adminGuard } from './admin.guard';
import { cambiosSinGuardarGuard } from './cambios-sin-guardar.guard';

export const adminRoutes: Routes = [
  { path: 'entrar', title: 'Acceso | Panel', loadComponent: () => import('./entrar').then((m) => m.Entrar) },
  {
    path: '',
    loadComponent: () => import('./layout-admin').then((m) => m.LayoutAdmin),
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', title: 'Cursos | Panel', loadComponent: () => import('./lista-cursos').then((m) => m.ListaCursos) },
      { path: 'cursos/:id', title: 'Editar curso | Panel', canDeactivate: [cambiosSinGuardarGuard], loadComponent: () => import('./editar-curso').then((m) => m.EditarCurso) },
    ],
  },
];
