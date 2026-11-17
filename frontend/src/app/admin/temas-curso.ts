import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from './admin-api.service';
import { EditorMarkdown } from './editor-markdown';
import { mensajeError } from './errores-admin';
import { TemaAdmin } from './modelos-admin';

interface Borrador {
  id: number | null; // null = tema nuevo
  titulo: string;
  contenido: string;
}

@Component({
  selector: 'app-temas-curso',
  imports: [FormsModule, EditorMarkdown],
  template: `
    <div class="cabecera">
      <h2>Temas</h2>
      <button type="button" class="boton" (click)="nuevo()">Nuevo tema</button>
    </div>

    @if (error()) { <p class="aviso error" role="alert">{{ error() }}</p> }

    @if (temas(); as lista) {
      @if (lista.length === 0) {
        <p class="suave">Este curso aún no tiene temas.</p>
      }
      <ol class="lista">
        @for (t of lista; track t.id; let i = $index; let ultimo = $last) {
          <li class="tema tarjeta" [class.activo]="borrador()?.id === t.id">
            <span class="titulo">{{ i + 1 }}. {{ t.titulo }}</span>
            <span class="botones">
              <button type="button" class="boton secundario" aria-label="Subir" [disabled]="i === 0 || moviendo()" (click)="mover(i, -1)">↑</button>
              <button type="button" class="boton secundario" aria-label="Bajar" [disabled]="ultimo || moviendo()" (click)="mover(i, 1)">↓</button>
              <button type="button" class="boton secundario" aria-label="Editar" (click)="editar(t)">Editar</button>
              <button type="button" class="boton secundario" aria-label="Borrar" (click)="borrar(t)">Borrar</button>
            </span>
          </li>
        }
      </ol>
    } @else {
      <p class="cargando">Cargando…</p>
    }

    @if (borrador(); as b) {
      <form class="tarjeta editor" (submit)="guardar($event)">
        <h3>{{ b.id === null ? 'Nuevo tema' : 'Editar tema' }}</h3>
        <div class="campo">
          <label for="titulo-tema">Título del tema</label>
          <input id="titulo-tema" name="titulo" type="text" maxlength="200" [ngModel]="b.titulo" (ngModelChange)="poner('titulo', $event)" />
        </div>
        <div class="campo">
          <label for="contenido-tema">Contenido (Markdown)</label>
          <app-editor-markdown idArea="contenido-tema" [valor]="b.contenido" (valorChange)="poner('contenido', $event)" />
        </div>
        @if (errorForm()) { <p class="aviso error" role="alert">{{ errorForm() }}</p> }
        <div class="acciones">
          <button type="submit" class="boton" [disabled]="guardando()">Guardar tema</button>
          <button type="button" class="boton secundario" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    }
  `,
  styles: `
    .cabecera { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .lista { list-style: none; padding: 0; margin: 0 0 20px; display: grid; gap: 8px; }
    .tema { display: flex; align-items: center; justify-content: space-between; gap: 8px 12px; flex-wrap: wrap; }
    .tema.activo { outline: 2px solid var(--color-acento, currentColor); }
    .botones { display: flex; gap: 6px; flex-wrap: wrap; }
    .editor { margin-top: 12px; }
  `,
})
export class TemasCurso implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly cursoId = input.required<number>();

  protected readonly temas = signal<TemaAdmin[] | null>(null);
  protected readonly borrador = signal<Borrador | null>(null);
  private readonly original = signal('');
  protected readonly error = signal('');
  protected readonly errorForm = signal('');
  protected readonly guardando = signal(false);
  protected readonly moviendo = signal(false);

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
    this.api.temas(this.cursoId()).subscribe({
      next: (t) => this.temas.set(t),
      error: (e) => this.error.set(mensajeError(e, 'No se pudieron cargar los temas.')),
    });
  }

  private abrir(b: Borrador): void {
    if (this.sucio() && !confirm('Hay cambios sin guardar en el tema. ¿Descartarlos?')) return;
    this.errorForm.set('');
    this.original.set(JSON.stringify(b));
    this.borrador.set(b);
  }

  protected nuevo(): void {
    this.abrir({ id: null, titulo: '', contenido: '' });
  }

  protected editar(t: TemaAdmin): void {
    this.abrir({ id: t.id, titulo: t.titulo, contenido: t.contenido });
  }

  protected cancelar(): void {
    if (this.sucio() && !confirm('Hay cambios sin guardar en el tema. ¿Descartarlos?')) return;
    this.borrador.set(null);
    this.original.set('');
  }

  protected poner(campo: 'titulo' | 'contenido', valor: string): void {
    this.borrador.update((b) => (b ? { ...b, [campo]: valor } : b));
  }

  protected mover(i: number, delta: number): void {
    const lista = this.temas();
    if (!lista) return;
    const ids = lista.map((t) => t.id);
    const j = i + delta;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    this.error.set('');
    this.moviendo.set(true);
    this.api.ordenarTemas(this.cursoId(), ids).subscribe({
      next: (t) => {
        this.moviendo.set(false);
        this.temas.set(t);
      },
      error: (e) => {
        this.moviendo.set(false);
        this.error.set(mensajeError(e, 'No se pudo cambiar el orden.'));
      },
    });
  }

  protected borrar(t: TemaAdmin): void {
    if (!confirm(`¿Borrar el tema "${t.titulo}"? No se puede deshacer.`)) return;
    this.error.set('');
    this.api.borrarTema(this.cursoId(), t.id).subscribe({
      next: () => {
        this.temas.update((l) => (l ?? []).filter((x) => x.id !== t.id));
        if (this.borrador()?.id === t.id) {
          this.borrador.set(null);
          this.original.set('');
        }
      },
      error: (e) => this.error.set(mensajeError(e, 'No se pudo borrar el tema.')),
    });
  }

  protected guardar(evento: Event): void {
    evento.preventDefault();
    const b = this.borrador();
    if (!b) return;
    const titulo = b.titulo.trim();
    if (!titulo) {
      this.errorForm.set('Escribe un título para el tema.');
      return;
    }
    if (!b.contenido.trim()) {
      this.errorForm.set('Escribe el contenido del tema.');
      return;
    }
    this.errorForm.set('');
    this.guardando.set(true);
    const datos = { titulo, contenido: b.contenido };
    const peticion = b.id === null ? this.api.crearTema(this.cursoId(), datos) : this.api.guardarTema(this.cursoId(), b.id, datos);
    peticion.subscribe({
      next: (t) => {
        this.guardando.set(false);
        this.temas.update((l) => {
          const lista = l ?? [];
          return b.id === null ? [...lista, t] : lista.map((x) => (x.id === t.id ? t : x));
        });
        this.borrador.set(null);
        this.original.set('');
      },
      error: (e) => {
        this.guardando.set(false);
        this.errorForm.set(mensajeError(e, 'No se pudo guardar el tema.'));
      },
    });
  }
}
