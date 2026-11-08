import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { delay, of } from 'rxjs';
import { Orcamento } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento.service';
import { firebaseTestProviders } from '../../testing/firebase-test-providers';
import { Formulario } from './formulario';

describe('Formulario', () => {
  let fixture: ComponentFixture<Formulario>;
  let routeId: string | null;
  const atualizarOrcamento = vi.fn();
  const orcamentoOriginal: Orcamento = {
    id_orcamento: 'orcamento-1',
    nome_projeto: 'Projeto original',
    data_orcamento: '2020-01-01',
    cliente: 'Cliente',
    prazo_de_entrega: '30 dias',
    valor_total: 1254.56,
    status: 'Em produção',
    itens: [
      {
        descricao: 'Armário',
        med_largura: 1,
        med_altura: 1,
        med_profundidade: 1,
        material_por_metro3: 1234.56,
        metro_movel3: 1,
        insumos: 20,
        taxa_mao_de_obra: 0,
        valor: 1254.56,
      },
    ],
  };

  beforeEach(async () => {
    routeId = null;
    orcamentoOriginal.status = 'Em produção';
    atualizarOrcamento.mockReset().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [Formulario],
      providers: [
        {
          provide: OrcamentoService,
          useValue: {
            obterOrcamento: () => of(orcamentoOriginal).pipe(delay(0)),
            obterRascunho: () => undefined,
            atualizarOrcamento,
            limparRascunho: vi.fn(),
          },
        },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => routeId } } },
        },
        ...firebaseTestProviders,
      ],
    }).compileComponents();
  });

  async function criarComponente(): Promise<Formulario> {
    fixture = TestBed.createComponent(Formulario);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  it('should create', async () => {
    expect(await criarComponente()).toBeTruthy();
  });

  it('updates an estimate with today’s date', async () => {
    routeId = 'orcamento-1';
    const component = await criarComponente();
    const data = new Date();
    const hoje = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
    component.itens.at(0).controls.descricao.setValue('Portas em <strong>MDF</strong>');

    expect(component.orcamentoId).toBe('orcamento-1');
    expect(component.form.valid).toBe(true);
    await component.salvar();

    expect(atualizarOrcamento).toHaveBeenCalledWith(
      'orcamento-1',
      expect.objectContaining({
        data_orcamento: hoje,
        valor_total: 1254.56,
        itens: [expect.objectContaining({ descricao: 'Armário: Portas em <strong>MDF</strong>' })],
      }),
    );
  });

  it('preserves the wood price per cubic meter when editing an estimate', async () => {
    routeId = 'orcamento-1';
    const component = await criarComponente();

    expect(component.itens.at(0).controls.madeira.value).toBe('1234.56');
    await component.salvar();

    expect(atualizarOrcamento).toHaveBeenCalledWith(
      'orcamento-1',
      expect.objectContaining({
        valor_total: 1254.56,
        itens: [expect.objectContaining({
          material_por_metro3: 1234.56,
          valor: 1254.56,
        })],
      }),
    );
  });

  it('shows a green status indicator and label when the estimate is finalized', async () => {
    routeId = 'orcamento-1';
    orcamentoOriginal.status = 'Finalizado';
    await criarComponente();
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector('.status') as HTMLElement;
    expect(status.classList).toContain('status--finalizado');
    expect(status.textContent).toContain('Finalizado');

  });

  it('applies bold only to the selected description text', async () => {
    const component = await criarComponente();
    const editor = fixture.nativeElement.querySelector('.rich-text-editor__input') as HTMLDivElement;
    const descricao = 'Fabricar e instalar mesa em, MDF revestido.';
    editor.textContent = descricao;
    editor.dispatchEvent(new Event('input', { bubbles: true }));

    const textoSelecionado = 'MDF revestido';
    const inicio = descricao.indexOf(textoSelecionado);
    const intervalo = document.createRange();
    intervalo.setStart(editor.firstChild!, inicio);
    intervalo.setEnd(editor.firstChild!, inicio + textoSelecionado.length);
    const selecao = window.getSelection()!;
    selecao.removeAllRanges();
    selecao.addRange(intervalo);

    (fixture.nativeElement.querySelector('.rich-text-editor__bold') as HTMLButtonElement).click();

    expect(component.itens.at(0).controls.descricao.value).toBe(
      'Fabricar e instalar mesa em, <strong>MDF revestido</strong>.',
    );
  });
});
