import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { EMPRESA_DATOS } from '../../core/empresa';
import { CursoCatalogo } from '../../core/modelos';
import { RouterLink } from '@angular/router';
import { TarjetaCurso } from '../../componentes/tarjeta-curso';

@Component({
  selector: 'app-portada',
  imports: [TarjetaCurso, RouterLink],
  templateUrl: './portada.html',
  styleUrl: './portada.scss',
})
export class Portada {
  protected readonly empresa = inject(EMPRESA_DATOS);
  /** undefined: cargando; null: error al cargar. */
  protected readonly catalogo = toSignal<CursoCatalogo[] | null | undefined>(
    inject(ApiService)
      .catalogo()
      .pipe(catchError(() => of(null))),
  );
  protected readonly urlWhatsapp = this.empresa.whatsapp ? `https://wa.me/${this.empresa.whatsapp}` : null;
}
