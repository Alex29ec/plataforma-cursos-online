import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Verificacion } from '../../core/modelos';
import { VerificarPagina } from './verificar';

describe('VerificarPagina', () => {
  let api: { verificar: ReturnType<typeof vi.fn> };

  async function montar(respuesta: Verificacion, codigo?: string) {
    api = { verificar: vi.fn().mockReturnValue(of(respuesta)) };
    TestBed.configureTestingModule({
      imports: [VerificarPagina],
      providers: [provideRouter([]), { provide: ApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(VerificarPagina);
    if (codigo) fixture.componentRef.setInput('codigo', codigo);
    await fixture.whenStable();
    return fixture;
  }

  it('con código en la URL consulta automáticamente y muestra el diploma válido', async () => {
    const fixture = await montar(
      {
        valido: true,
        codigo: 'MA-AAAA-BBBB',
        titular: 'Ana García',
        dniEnmascarado: '***4567**',
        curso: 'Curso de Manipulador de Alimentos',
        horas: 10,
        fechaEmision: '2026-11-16',
      },
      'MA-AAAA-BBBB',
    );
    expect(api.verificar).toHaveBeenCalledWith('MA-AAAA-BBBB');
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Diploma válido');
    expect(texto).toContain('Ana García');
    expect(texto).toContain('***4567**');
    expect(texto).toContain('Curso de Manipulador de Alimentos');
    expect(texto).toContain('10 horas');
    expect(texto).toContain('16/11/2026');
  });

  it('con código inexistente muestra que no se ha encontrado', async () => {
    const fixture = await montar({ valido: false }, 'MA-ZZZZ-ZZZZ');
    expect(fixture.nativeElement.textContent).toContain('No se ha encontrado ningún diploma con ese código');
  });

  it('sin código en la URL no consulta hasta que se envía el formulario', async () => {
    const fixture = await montar({ valido: false });
    expect(api.verificar).not.toHaveBeenCalled();
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector<HTMLInputElement>('#codigo')!;
    input.value = ' ma-aaaa-bbbb ';
    input.dispatchEvent(new Event('input'));
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    expect(api.verificar).toHaveBeenCalledWith('ma-aaaa-bbbb');
  });
});
