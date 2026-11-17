import { Component, ElementRef, ViewEncapsulation, computed, input, model, signal, viewChild } from '@angular/core';
import { marked } from 'marked';

/** Textarea con botones de formato y vista previa Markdown (lado a lado desde 900 px; pestañas debajo). */
@Component({
  selector: 'app-editor-markdown',
  template: `
    <div class="em-barra" role="toolbar" aria-label="Formato">
      <button type="button" class="boton secundario" title="Negrita" (click)="envolver('**', '**')"><strong>B</strong></button>
      <button type="button" class="boton secundario" title="Cursiva" (click)="envolver('_', '_')"><em>I</em></button>
      <button type="button" class="boton secundario" title="Título" (click)="prefijar('## ')">Título</button>
      <button type="button" class="boton secundario" title="Lista" (click)="prefijar('- ')">Lista</button>
    </div>
    <div class="em-pestanas" role="tablist">
      <button type="button" role="tab" [attr.aria-selected]="vista() === 'editar'" (click)="vista.set('editar')">Editar</button>
      <button type="button" role="tab" [attr.aria-selected]="vista() === 'previa'" (click)="vista.set('previa')">Vista previa</button>
    </div>
    <div class="em-paneles">
      <div class="em-panel" [class.activo]="vista() === 'editar'">
        <textarea
          #area
          class="em-area"
          [id]="idArea()"
          rows="16"
          maxlength="20000"
          [value]="valor()"
          (input)="valor.set(area.value)"
        ></textarea>
      </div>
      <div class="em-panel" [class.activo]="vista() === 'previa'">
        <div class="previa tarjeta" [innerHTML]="html()"></div>
      </div>
    </div>
  `,
  // Sin encapsulación: el HTML de la vista previa entra por innerHTML.
  encapsulation: ViewEncapsulation.None,
  styles: `
    app-editor-markdown .em-barra { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
    app-editor-markdown .em-pestanas { display: flex; gap: 6px; margin-bottom: 8px; }
    app-editor-markdown .em-pestanas button { padding: 6px 12px; border: 1px solid var(--color-borde); background: transparent; border-radius: 6px; cursor: pointer; font: inherit; }
    app-editor-markdown .em-pestanas button[aria-selected='true'] { background: var(--color-borde); font-weight: 600; }
    app-editor-markdown .em-paneles { display: block; }
    app-editor-markdown .em-panel { display: none; }
    app-editor-markdown .em-panel.activo { display: block; }
    app-editor-markdown .em-area { width: 100%; min-height: 320px; font: inherit; line-height: 1.5; box-sizing: border-box; }
    app-editor-markdown .previa { min-height: 320px; overflow: auto; }
    app-editor-markdown .previa > :first-child { margin-top: 0; }
    app-editor-markdown .previa :is(h2, h3) { margin-top: 1.2em; }
    app-editor-markdown .previa blockquote { margin: 0 0 1em; padding: 10px 14px; border-left: 4px solid var(--color-borde); }
    @media (min-width: 900px) {
      app-editor-markdown .em-pestanas { display: none; }
      app-editor-markdown .em-paneles { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      app-editor-markdown .em-panel { display: block; }
    }
  `,
})
export class EditorMarkdown {
  readonly valor = model('');
  readonly idArea = input('contenido');
  private readonly area = viewChild.required<ElementRef<HTMLTextAreaElement>>('area');
  protected readonly vista = signal<'editar' | 'previa'>('editar');
  protected readonly html = computed(() => marked.parse(this.valor(), { async: false }) as string);

  /** Envuelve la selección (o inserta los marcadores si no hay selección). */
  protected envolver(antes: string, despues: string): void {
    const a = this.area().nativeElement;
    const { selectionStart: ini, selectionEnd: fin, value } = a;
    const sel = value.slice(ini, fin);
    this.aplicar(value.slice(0, ini) + antes + sel + despues + value.slice(fin), ini + antes.length, fin + antes.length);
  }

  /** Antepone un prefijo a cada línea de la selección. */
  protected prefijar(prefijo: string): void {
    const a = this.area().nativeElement;
    const { selectionStart: ini, selectionEnd: fin, value } = a;
    const inicioLinea = value.lastIndexOf('\n', ini - 1) + 1;
    const bloque = value.slice(inicioLinea, fin);
    const nuevo = bloque
      .split('\n')
      .map((l) => prefijo + l)
      .join('\n');
    this.aplicar(value.slice(0, inicioLinea) + nuevo + value.slice(fin), ini + prefijo.length, fin + (nuevo.length - bloque.length));
  }

  private aplicar(texto: string, selIni: number, selFin: number): void {
    this.valor.set(texto);
    const a = this.area().nativeElement;
    a.value = texto;
    a.focus();
    a.setSelectionRange(selIni, selFin);
  }
}
