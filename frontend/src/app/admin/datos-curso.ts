import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from './admin-api.service';
import { camposError, mensajeError } from './errores-admin';
import { CursoAdmin, DatosCurso as DatosCursoDto, EstadoCurso, ETIQUETA_ESTADO } from './modelos-admin';

interface Formulario {
  titulo: string;
  slug: string;
  resumen: string;
  descripcion: string;
  horas: number | null;
  precio: string;
  notaMinima: number | null;
  numPreguntas: number | null;
  orden: number | null;
}

const AYUDA_ESTADO: Record<EstadoCurso, string> = {
  BORRADOR: 'Solo lo ves tú',
  PROXIMAMENTE: 'Aparece en la portada, aún no se puede hacer',
  PUBLICADO: 'Se puede hacer y comprar',
};
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGEN = 5 * 1024 * 1024;

/** "19,90", "19.90" o "19" → céntimos; null si no es válido o está fuera de 0–100000. */
export function parsearPrecio(texto: string): number | null {
  const t = texto.trim();
  if (!/^\d+([.,]\d{1,2})?$/.test(t)) return null;
  const centimos = Math.round(parseFloat(t.replace(',', '.')) * 100);
  return centimos >= 0 && centimos <= 100000 ? centimos : null;
}

function aFormulario(c: CursoAdmin): Formulario {
  return {
    titulo: c.titulo,
    slug: c.slug,
    resumen: c.resumen ?? '',
    descripcion: c.descripcion ?? '',
    horas: c.horas,
    precio: (c.precioCentimos / 100).toFixed(2).replace('.', ','),
    notaMinima: c.notaMinima,
    numPreguntas: c.numPreguntas,
    orden: c.orden,
  };
}

@Component({
  selector: 'app-datos-curso',
  imports: [FormsModule],
  template: `
    <form class="tarjeta" (submit)="guardar($event)" novalidate>
      <div class="campo">
        <label for="titulo">Título</label>
        <input id="titulo" name="titulo" type="text" maxlength="200" [ngModel]="form().titulo" (ngModelChange)="poner('titulo', $event)" />
        @if (errorDe('titulo'); as e) { <p class="error-campo">{{ e }}</p> }
      </div>
      <div class="campo">
        <label for="slug">Slug (dirección web)</label>
        <input id="slug" name="slug" type="text" maxlength="100" [disabled]="actual().estado !== 'BORRADOR'" [ngModel]="form().slug" (ngModelChange)="poner('slug', $event)" />
        @if (actual().estado !== 'BORRADOR') { <p class="suave">Solo se puede cambiar mientras el curso es un borrador.</p> }
        @if (errorDe('slug'); as e) { <p class="error-campo">{{ e }}</p> }
      </div>
      <div class="campo">
        <label for="resumen">Resumen</label>
        <input id="resumen" name="resumen" type="text" maxlength="200" [ngModel]="form().resumen" (ngModelChange)="poner('resumen', $event)" />
        @if (errorDe('resumen'); as e) { <p class="error-campo">{{ e }}</p> }
      </div>
      <div class="campo">
        <label for="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows="6" maxlength="4000" [ngModel]="form().descripcion" (ngModelChange)="poner('descripcion', $event)"></textarea>
        @if (errorDe('descripcion'); as e) { <p class="error-campo">{{ e }}</p> }
      </div>
      <div class="rejilla">
        <div class="campo">
          <label for="horas">Horas</label>
          <input id="horas" name="horas" type="number" min="1" max="1000" [ngModel]="form().horas" (ngModelChange)="poner('horas', $event)" />
          @if (errorDe('horas'); as e) { <p class="error-campo">{{ e }}</p> }
        </div>
        <div class="campo">
          <label for="precio">Precio (€)</label>
          <input id="precio" name="precio" type="text" inputmode="decimal" [ngModel]="form().precio" (ngModelChange)="poner('precio', $event)" />
          @if (errorDe('precio'); as e) { <p class="error-campo">{{ e }}</p> }
        </div>
        <div class="campo">
          <label for="notaMinima">Nota mínima (%)</label>
          <input id="notaMinima" name="notaMinima" type="number" min="1" max="100" [ngModel]="form().notaMinima" (ngModelChange)="poner('notaMinima', $event)" />
          @if (errorDe('notaMinima'); as e) { <p class="error-campo">{{ e }}</p> }
        </div>
        <div class="campo">
          <label for="numPreguntas">Preguntas por examen</label>
          <input id="numPreguntas" name="numPreguntas" type="number" min="1" max="200" [ngModel]="form().numPreguntas" (ngModelChange)="poner('numPreguntas', $event)" />
          @if (errorDe('numPreguntas'); as e) { <p class="error-campo">{{ e }}</p> }
        </div>
        <div class="campo">
          <label for="orden">Orden en el catálogo</label>
          <input id="orden" name="orden" type="number" min="0" max="9999" [ngModel]="form().orden" (ngModelChange)="poner('orden', $event)" />
          @if (errorDe('orden'); as e) { <p class="error-campo">{{ e }}</p> }
        </div>
      </div>

      @if (errorGuardar()) { <p class="aviso error" role="alert">{{ errorGuardar() }}</p> }
      @if (mensajeGuardado()) { <p class="aviso ok" role="status">{{ mensajeGuardado() }}</p> }
      <div class="acciones">
        <button type="submit" class="boton" [disabled]="guardando()">Guardar datos</button>
      </div>
    </form>

    <section class="tarjeta bloque">
      <h2>Foto</h2>
      @if (actual().imagenUrl; as url) {
        <img class="vista-previa" [src]="url" alt="Foto del curso" />
      } @else {
        <p class="suave">Sin foto.</p>
      }
      <div class="campo">
        <label for="foto">{{ actual().imagenUrl ? 'Cambiar foto' : 'Subir foto' }} (JPG, PNG o WebP, máx. 5 MB)</label>
        <input id="foto" type="file" accept="image/jpeg,image/png,image/webp" (change)="subir($event)" />
      </div>
      @if (actual().imagenUrl) {
        <button type="button" class="boton secundario" (click)="quitarFoto()">Quitar foto</button>
      }
      @if (errorFoto()) { <p class="aviso error" role="alert">{{ errorFoto() }}</p> }
    </section>

    <section class="tarjeta bloque">
      <h2>Estado</h2>
      <div class="campo">
        <label for="estado">Estado del curso</label>
        <select id="estado" #sel (change)="cambiarEstado(sel)">
          @for (e of estados; track e) {
            <option [value]="e" [selected]="actual().estado === e">{{ etiquetas[e] }}</option>
          }
        </select>
      </div>
      <ul class="suave ayudas">
        @for (e of estados; track e) {
          <li><strong>{{ etiquetas[e] }}</strong>: {{ ayuda[e] }}</li>
        }
      </ul>
      @if (errorEstado()) { <p class="aviso error" role="alert">{{ errorEstado() }}</p> }
    </section>
  `,
  styles: `
    .bloque { margin-top: 20px; }
    .rejilla { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0 16px; }
    .vista-previa { max-width: 320px; width: 100%; border-radius: 8px; display: block; margin-bottom: 12px; }
    .ayudas { padding-left: 18px; }
  `,
})
export class DatosCurso {
  private readonly api = inject(AdminApiService);

  readonly curso = input.required<CursoAdmin>();
  readonly cursoCambiado = output<CursoAdmin>();

  protected readonly estados: EstadoCurso[] = ['BORRADOR', 'PROXIMAMENTE', 'PUBLICADO'];
  protected readonly etiquetas = ETIQUETA_ESTADO;
  protected readonly ayuda = AYUDA_ESTADO;

  protected readonly actual = linkedSignal<CursoAdmin>(() => this.curso());
  // La fuente es el texto de los campos: foto y estado no reinician las ediciones sin guardar.
  protected readonly form = linkedSignal<string, Formulario>({
    source: () => JSON.stringify(aFormulario(this.actual())),
    computation: (origen) => JSON.parse(origen) as Formulario,
  });
  protected readonly errores = signal<Record<string, string>>({});
  protected readonly errorGuardar = signal('');
  protected readonly mensajeGuardado = signal('');
  protected readonly errorFoto = signal('');
  protected readonly errorEstado = signal('');
  protected readonly guardando = signal(false);

  private readonly hayCambios = computed(() => JSON.stringify(this.form()) !== JSON.stringify(aFormulario(this.actual())));

  tieneCambios(): boolean {
    return this.hayCambios();
  }

  protected poner<K extends keyof Formulario>(campo: K, valor: Formulario[K]): void {
    this.form.update((f) => ({ ...f, [campo]: valor }));
  }

  protected errorDe(campo: string): string | undefined {
    const e = this.errores();
    return e[campo] ?? (campo === 'precio' ? e['precioCentimos'] : undefined);
  }

  protected guardar(evento: Event): void {
    evento.preventDefault();
    const f = this.form();
    this.errorGuardar.set('');
    this.mensajeGuardado.set('');
    const precio = parsearPrecio(f.precio);
    if (precio === null) {
      this.errores.set({ precio: 'Escribe un precio válido entre 0 y 1000 € (por ejemplo 19,90).' });
      return;
    }
    this.errores.set({});
    const datos: DatosCursoDto = {
      slug: f.slug,
      titulo: f.titulo,
      resumen: f.resumen,
      descripcion: f.descripcion ?? '',
      horas: f.horas as number,
      precioCentimos: precio,
      notaMinima: f.notaMinima as number,
      numPreguntas: f.numPreguntas as number,
      orden: f.orden as number,
    };
    this.guardando.set(true);
    this.api.guardarCurso(this.actual().id, datos).subscribe({
      next: (c) => {
        this.guardando.set(false);
        this.aplicar(c);
        this.form.set(aFormulario(c));
        this.errorEstado.set('');
        this.mensajeGuardado.set('Datos guardados.');
      },
      error: (e) => {
        this.guardando.set(false);
        const campos = camposError(e);
        this.errores.set(campos);
        this.errorGuardar.set(Object.keys(campos).length ? 'Revisa los campos marcados.' : mensajeError(e, 'No se pudieron guardar los datos.'));
      },
    });
  }

  protected subir(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const fichero = input.files?.[0];
    if (!fichero) return;
    this.errorFoto.set('');
    // Se vacía el selector también al rechazar: así elegir otra vez el mismo fichero vuelve a disparar (change).
    if (!TIPOS_IMAGEN.includes(fichero.type)) {
      this.errorFoto.set('La foto debe ser JPG, PNG o WebP.');
      input.value = '';
      return;
    }
    if (fichero.size > MAX_IMAGEN) {
      this.errorFoto.set('La foto no puede pesar más de 5 MB.');
      input.value = '';
      return;
    }
    this.api.subirImagen(this.actual().id, fichero).subscribe({
      next: (c) => this.aplicar(c),
      error: (e) => this.errorFoto.set(mensajeError(e, 'No se pudo subir la foto.')),
    });
    input.value = '';
  }

  protected quitarFoto(): void {
    this.errorFoto.set('');
    this.api.quitarImagen(this.actual().id).subscribe({
      next: (c) => this.aplicar(c),
      error: (e) => this.errorFoto.set(mensajeError(e, 'No se pudo quitar la foto.')),
    });
  }

  protected cambiarEstado(sel: HTMLSelectElement): void {
    const estado = sel.value as EstadoCurso;
    this.errorEstado.set('');
    this.api.cambiarEstado(this.actual().id, estado).subscribe({
      next: (c) => this.aplicar(c),
      error: (e) => {
        sel.value = this.actual().estado;
        this.errorEstado.set(mensajeError(e, 'No se pudo cambiar el estado.'));
      },
    });
  }

  private aplicar(c: CursoAdmin): void {
    this.actual.set(c);
    this.cursoCambiado.emit(c);
  }
}
