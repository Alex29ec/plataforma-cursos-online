import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SesionAdminService } from './sesion-admin.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return inject(SesionAdminService)
    .comprobar()
    .pipe(map((hay) => hay || router.createUrlTree(['/admin/entrar'], { queryParams: { volver: state.url } })));
};
