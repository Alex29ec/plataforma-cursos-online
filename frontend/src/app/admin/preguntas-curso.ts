import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { AdminApiService } from './admin-api.service';
import { mensajeError } from './errores-admin';
import { PreguntaAdmin } from './modelos-admin';

interface Borrador {
  id: number | null; // null = pregunta nueva
  enunciado: string;
  opciones: string[];
  correcta: number | null;
}

const MIN_OPCIONES = 2;
const MAX_OPCIONES = 6;

const normalizar = (s: string): string => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

@Component({
  selector: 'app-preguntas-curso',
  template: `
    <div class="cabecera">
      <h2>Preguntas</h2>
      <button type="button" class="boton" (click)="nueva()">Nueva pregunta</button>
    </div>

    @if (preguntas() !== null) {
      <p class="contador">{{ textoContador() }}</p>
    }
    @if (error()) { <p class="aviso error" role="alert">{{ error() }}</p> }

    <div class="campo">
      <label for="buscar-pregunta">Buscar</label>
      <input id="buscar-pregunta" type="search" placeholder="Texto del enunciado" [value]="busqueda()" (input)="busqueda.set($any($event.target).value)" />
    </div>

    @if (filtradas(); as lista) {
      @if (preguntas() !== null && lista.length === 0) {
        <p class="suave">No hay preguntas que mostrar.</p>
      }
      <ul class="lista">
        @for (p of lista; track p.id) {
          <li class="pregunta tarjeta" [class.inactiva]="!p.activa">
            <span class="enunciado">{{ p.enunciado }}</span>
            @if (!p.activa) { <span class="etiqueta">Desactivada</span> }
            <span class="botones">
              <button type="button" class="boton secundario" (click)="editar(p)">Editar</button>
              @if (p.activa) {
                <button type="button" class="boton secundario borrar" (click)="borrar(p)">Borrar</button>
              }
            </span>
          </li>
        }
      </ul>
    }

    @if (borrador(); as b) {
      <form class="tarjeta editor editor-pregunta" (submit)="guardar($event)">
        <h3>{{ b.id === null ? 'Nueva pregunta' : 'Editar pregunta' }}</h3>
        <div class="campo">
          <label for="enunciado">Enunciado</label>
          <textarea id="enunciado" rows="3" maxlength="1000" [value]="b.enunciado" (input)="ponerEnunciado($any($event.target).value)"></textarea>
        </div>
        <fieldset class="opciones">
          <legend>Opciones (marca la correcta)</legend>
          @for (o of b.opciones; track $index; let i = $index) {
            <div class="opcion">
              <input type="radio" name="correcta" [attr.aria-label]="'Opción ' + (i + 1) + ' correcta'" [checked]="b.correcta === i" (change)="marcar(i)" />
              <input type="text" maxlength="500" [attr.aria-label]="'Opción ' + (i + 1)" [value]="o" (input)="ponerOpcion(i, $any($event.target).value)" />
              <button type="button" class="boton secundario quitar" [disabled]="b.opciones.length <= minOpciones" (click)="quitar(i)">Quitar</button>
            </div>
          }
        </fieldset>
        <button type="button" class="boton secundario" [disabled]="b.opciones.length >= maxOpciones" (click)="anadir()">Añadir opción</button>
        @if (errorForm()) { <p class="aviso error" role="alert">{{ errorForm() }}</p> }
        <div class="acciones">
          <button type="submit" class="boton" [disabled]="guardando()">Guardar pregunta</button>
          <button type="button" class="boton secundario" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    }
  `,
  styles: `
    .cabecera { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .lista { list-style: none; padding: 0; margin: 0 0 20px; display: grid; gap: 8px; }
    .pregunta { display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; }
    .pregunta .enunciado { flex: 1 1 300px; }
    .pregunta.inactiva { opacity: 0.55; }
    .etiqueta { font-size: 0.8em; font-weight: 600; padding: 2px 8px; border-radius: 10px; border: 1px solid var(--color-borde); }
    .botones { display: flex; gap: 6px; }
    .editor { margin-top: 12px; }
    .opciones { border: 0; padding: 0; margin: 0 0 12px; display: grid; gap: 8px; }
    .opcion { display: flex; align-items: center; gap: 8px; }
    .opcion input[type='text'] { flex: 1; }
  `,
})
export class PreguntasCurso implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly cursoId = input.required<number>();
  readonly numPreguntas = input.required<number>();

  protected readonly minOpciones = MIN_OPCIONES;
  protected readonly maxOpciones = MAX_OPCIONES;
  protected readonly preguntas = signal<PreguntaAdmin[] | null>(null);
  protected readonly busqueda = signal('');
  protected readonly borrador = signal<Borrador | null>(null);
  private readonly original = signal('');
  protected readonly error = signal('');
  protected readonly errorForm = signal('');
  protected readonly guardando = signal(false);

  protected readonly activas = computed(() => (this.preguntas() ?? []).filter((p) => p.activa).length);
  protected readonly textoContador = computed(() => {
    const n = this.activas();
    return `${n} ${n === 1 ? 'pregunta activa' : 'preguntas activas'} · el examen usa ${this.numPreguntas()}`;
  });
  protected readonly filtradas = computed(() => {
    const q = normalizar(this.busqueda().trim());
    const todas = this.preguntas() ?? [];
    return q ? todas.filter((p) => normalizar(p.enunciado).includes(q)) : todas;
  });

  private readonly sucio = computed(() => {
    const b = this.borrador();
    return b !== null && JSON.stringify(b) !== this.original();
  });

  ngOnInit(): void {
    this.cargar();
  }

  tieneCambios(): boolean {
    return this.sucio();
  }

  private cargar(): void {
    this.api.preguntas(this.cursoId()).subscribe({
      next: (p) => this.preguntas.set(p),
      error: (e) => this.error.set(mensajeError(e, 'No se pudieron cargar las preguntas.')),
    });
  }

  private abrir(b: Borrador): void {
    if (this.sucio() && !confirm('Hay cambios sin guardar en la pregunta. ¿Descartarlos?')) return;
    this.errorForm.set('');
    this.original.set(JSON.stringify(b));
    this.borrador.set(b);
  }

  protected nueva(): void {
    this.abrir({ id: null, enunciado: '', opciones: ['', '', '', ''], correcta: null });
  }

  protected editar(p: PreguntaAdmin): void {
    this.abrir({ id: p.id, enunciado: p.enunciado, opciones: [...p.opciones], correcta: p.correcta });
  }

  protected cancelar(): void {
    if (this.sucio() && !confirm('Hay cambios sin guardar en la pregunta. ¿Descartarlos?')) return;
    this.borrador.set(null);
    this.original.set('');
  }

  protected ponerEnunciado(v: string): void {
    this.borrador.update((b) => (b ? { ...b, enunciado: v } : b));
  }

  protected ponerOpcion(i: number, v: string): void {
    this.borrador.update((b) => (b ? { ...b, opciones: b.opciones.map((o, k) => (k === i ? v : o)) } : b));
  }

  protected marcar(i: number): void {
    this.borrador.update((b) => (b ? { ...b, correcta: i } : b));
  }

  protected anadir(): void {
    this.borrador.update((b) => (b && b.opciones.length < MAX_OPCIONES ? { ...b, opciones: [...b.opciones, ''] } : b));
  }

  protected quitar(i: number): void {
    this.borrador.update((b) => {
      if (!b || b.opciones.length <= MIN_OPCIONES) return b;
      let correcta = b.correcta;
      if (correcta === i) correcta = null;
      else if (correcta !== null && correcta > i) correcta -= 1;
      return { ...b, opciones: b.opciones.filter((_, k) => k !== i), correcta };
    });
  }

  protected borrar(p: PreguntaAdmin): void {
    if (!confirm('¿Borrar esta pregunta? Quedará desactivada y dejará de usarse en los exámenes.')) return;
    this.error.set('');
    this.api.borrarPregunta(this.cursoId(), p.id).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(mensajeError(e, 'No se pudo borrar la pregunta.')),
    });
  }

  protected guardar(evento: Event): void {
    evento.preventDefault();
    const b = this.borrador();
    if (!b) return;
    const enunciado = b.enunciado.trim();
    const opciones = b.opciones.map((o) => o.trim());
    if (!enunciado) return this.errorForm.set('Escribe el enunciado.');
    if (opciones.some((o) => !o)) return this.errorForm.set('Ninguna opción puede estar vacía.');
    if (b.correcta === null) return this.errorForm.set('Marca cuál es la opción correcta.');
    this.errorForm.set('');
    this.guardando.set(true);
    const datos = { enunciado, opciones, correcta: b.correcta };
    const peticion = b.id === null ? this.api.crearPregunta(this.cursoId(), datos) : this.api.guardarPregunta(this.cursoId(), b.id, datos);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.borrador.set(null);
        this.original.set('');
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        this.errorForm.set(mensajeError(e, 'No se pudo guardar la pregunta.'));
      },
    });
  }
}
