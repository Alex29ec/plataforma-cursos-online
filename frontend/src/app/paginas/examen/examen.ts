import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AlmacenLocalService } from '../../core/almacen-local.service';
import { IntentoCreado } from '../../core/modelos';

@Component({
  selector: 'app-examen',
  imports: [RouterLink],
  templateUrl: './examen.html',
  styleUrl: './examen.scss',
})
export class Examen implements OnInit {
  private readonly api = inject(ApiService);
  private readonly almacen = inject(AlmacenLocalService);
  private readonly router = inject(Router);

  /** Curso del examen (parámetro de ruta). */
  readonly slug = input.required<string>();

  protected readonly intento = signal<IntentoCreado | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly respuestas = signal<Record<number, number>>({});
  protected readonly confirmando = signal(false);
  protected readonly enviando = signal(false);

  protected readonly respondidas = computed(() => Object.keys(this.respuestas()).length);
  protected readonly total = computed(() => this.intento()?.preguntas.length ?? 0);
  protected readonly completo = computed(() => this.total() > 0 && this.respondidas() === this.total());

  ngOnInit(): void {
    this.empezar();
  }

  empezar(): void {
    this.error.set(null);
    this.respuestas.set({});
    this.confirmando.set(false);
    this.api.crearIntento(this.slug()).subscribe({
      next: (i) => this.intento.set(i),
      error: () => this.error.set('No se ha podido cargar el examen. Inténtalo de nuevo.'),
    });
  }

  elegir(preguntaId: number, opcion: number): void {
    this.respuestas.update((r) => ({ ...r, [preguntaId]: opcion }));
  }

  pedirConfirmacion(): void {
    if (this.completo()) {
      this.confirmando.set(true);
    }
  }

  entregar(): void {
    const intento = this.intento();
    if (!intento || !this.completo() || this.enviando()) {
      return;
    }
    this.enviando.set(true);
    this.api.entregar(intento.intentoId, this.respuestas()).subscribe({
      next: (resultado) => {
        if (resultado.aprobado) {
          this.almacen.guardarIntentoAprobado(intento.intentoId);
        }
        this.router.navigate(['/resultado'], {
          state: { resultado, intentoId: intento.intentoId, slug: this.slug() },
        });
      },
      error: () => {
        this.enviando.set(false);
        this.confirmando.set(false);
        this.error.set('No se ha podido entregar el examen. Inténtalo de nuevo.');
      },
    });
  }
}
