import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuTop } from '../../component/menu-top/menu-top';
import { RichTextEditor } from '../../component/rich-text-editor/rich-text-editor';
import { ItemOrcamento, Orcamento, OrcamentoFormDraft } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento.service';
import { errorCode } from '../../utils/error-code';

function numero(valor: string | number | null | undefined): number {
  if (typeof valor === 'number') return valor;
  let texto = (valor ?? '').toString().replace(/[R$\s]/g, '');
  if (!texto) return 0;
  if (texto.includes(',')) {
    texto = texto.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(texto)) {
    texto = texto.replace(/\./g, '');
  }
  const n = Number(texto);
  return Number.isFinite(n) ? n : 0;
}

const arredondar = (n: number, casas = 2) => Math.round(n * 10 ** casas) / 10 ** casas;
const SO_NUMERO = /^\s*\d+([.,]\d+)?\s*$/;

/** Formulário único para criação e edição de orçamentos e seus itens. */
@Component({
  imports: [MenuTop, RichTextEditor, RouterLink, ReactiveFormsModule],
  selector: 'app-formulario',
  standalone: true,
  styleUrl: './formulario.css',
  templateUrl: './formulario.html',
})
export class Formulario {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OrcamentoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly statusInicial = 'Em produção';
  readonly orcamentoId = this.route.snapshot.paramMap.get('id');

  salvando = false;
  salvandoStatus = false;
  carregando = !!this.orcamentoId;
  orcamentoEncontrado = false;
  erro = '';
  private orcamentoOriginal?: Orcamento;

  readonly form = this.fb.nonNullable.group({
    cliente: ['', Validators.required],
    arquiteto: [''],
    projeto: ['', Validators.required],
    prazo: ['', Validators.required],
    itens: this.fb.nonNullable.array([this.novoItem()]),
  });

  constructor() {
    if (!this.orcamentoId) return;
    const orcamentoId = this.orcamentoId;

    this.form.disable();
    this.service
      .obterOrcamento(orcamentoId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (orcamento) => {
          if (!orcamento) {
            this.erro = 'Orçamento não encontrado.';
          } else {
            this.orcamentoOriginal = orcamento;
            this.preencherFormulario(orcamento);
            const rascunho = this.service.obterRascunho(orcamentoId);
            if (rascunho) this.aplicarRascunho(rascunho);
            this.orcamentoEncontrado = true;
            this.form.enable();
          }
          this.carregando = false;
          this.changeDetector.detectChanges();
        },
        error: (erro) => {
          console.error('Erro ao carregar o orçamento:', errorCode(erro));
          this.erro = 'Não foi possível carregar o orçamento. Tente novamente.';
          this.carregando = false;
          this.changeDetector.detectChanges();
        },
      });
  }

  get itens() {
    return this.form.controls.itens;
  }

  get valorTotal(): number {
    return this.itens.controls.reduce((total, _, indice) => total + this.subtotal(indice), 0);
  }

  get statusAtual(): string | null {
    return this.orcamentoOriginal?.status ?? null;
  }

  get statusFinalizado(): boolean {
    return this.statusAtual === 'Finalizado' || this.statusAtual === 'Finalizados';
  }

  async alternarStatus(): Promise<void> {
    if (!this.orcamentoId || !this.orcamentoOriginal || this.salvandoStatus) return;

    const novoStatus = this.statusFinalizado ? 'Em produção' : 'Finalizado';
    this.salvandoStatus = true;
    this.erro = '';

    try {
      await this.service.atualizarOrcamento(this.orcamentoId, { status: novoStatus });
      this.orcamentoOriginal = { ...this.orcamentoOriginal, status: novoStatus };
    } catch (erro) {
      console.error('Erro ao alterar o status do orçamento:', errorCode(erro));
      this.erro = 'Não foi possível alterar o status do orçamento. Tente novamente.';
    } finally {
      this.salvandoStatus = false;
      this.changeDetector.detectChanges();
    }
  }

  private novoItem(inicial: Partial<OrcamentoFormDraft['itens'][number]> = {}) {
    return this.fb.nonNullable.group({
      nome: [inicial.nome ?? '', Validators.required],
      descricao: [inicial.descricao ?? ''],
      comprimento: [inicial.comprimento ?? '', [Validators.required, Validators.pattern(SO_NUMERO)]],
      altura: [inicial.altura ?? '', [Validators.required, Validators.pattern(SO_NUMERO)]],
      profundidade: [inicial.profundidade ?? '', [Validators.required, Validators.pattern(SO_NUMERO)]],
      madeira: [inicial.madeira ?? '', Validators.required],
      insumos: [inicial.insumos ?? '0'],
      maoDeObra: [inicial.maoDeObra ?? '0'],
    });
  }

  private preencherFormulario(orcamento: Orcamento): void {
    this.form.patchValue({
      cliente: orcamento.cliente,
      arquiteto: orcamento.arquiteto ?? '',
      projeto: orcamento.nome_projeto,
      prazo: orcamento.prazo_de_entrega ?? '',
    });

    this.itens.clear();
    for (const item of orcamento.itens ?? []) {
      const separador = item.descricao.indexOf(': ');
      const nome = separador >= 0 ? item.descricao.slice(0, separador) : item.descricao;
      let descricao = separador >= 0 ? item.descricao.slice(separador + 2) : '';
      if (item.descricao_negrito) {
        const descricaoEscapada = descricao.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        descricao = `<strong>${descricaoEscapada}</strong>`;
      }
      const precoMadeiraM3 = item.material_por_metro3 ??
        (item.metro_movel3 > 0
          ? Math.max(0, item.valor - item.insumos - item.taxa_mao_de_obra) / item.metro_movel3
          : 0);

      this.itens.push(this.novoItem({
        nome,
        descricao,
        comprimento: String(item.med_largura),
        altura: String(item.med_altura),
        profundidade: String(item.med_profundidade),
        madeira: String(precoMadeiraM3),
        insumos: String(item.insumos),
        maoDeObra: String(item.taxa_mao_de_obra),
      }));
    }

    if (this.itens.length === 0) this.itens.push(this.novoItem());
  }

  private aplicarRascunho(rascunho: OrcamentoFormDraft): void {
    this.form.patchValue({
      cliente: rascunho.cliente,
      arquiteto: rascunho.arquiteto,
      projeto: rascunho.projeto,
      prazo: rascunho.prazo,
    });
    this.itens.clear();
    for (const item of rascunho.itens) this.itens.push(this.novoItem(item));
    if (this.itens.length === 0) this.itens.push(this.novoItem());
  }

  adicionarMovel(): void {
    this.itens.push(this.novoItem());
  }

  removerMovel(indice: number): void {
    if (this.itens.length <= 1) return;
    this.itens.removeAt(indice);
  }

  subtotal(indice: number): number {
  const v = this.itens.at(indice).getRawValue();

  const comprimento = numero(v.comprimento);
  const altura = numero(v.altura);
  const profundidade = numero(v.profundidade);
  const volume = comprimento * altura * profundidade;
  const madeira = volume * numero(v.madeira);
  const insumos = numero(v.insumos);
  const maoDeObra = numero(v.maoDeObra);
  return arredondar(madeira + insumos + maoDeObra);
}

  brl(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  async visualizar(): Promise<void> {
    if (!this.orcamentoId || !this.orcamentoEncontrado || this.carregando) return;

    const rascunho = this.form.getRawValue();
    this.service.guardarRascunho(this.orcamentoId, rascunho);
    const orcamento = this.montarOrcamento();
    orcamento.id_orcamento = this.orcamentoId;

    await this.router.navigate(['/preview'], {
      state: {
        orcamentoPreview: orcamento,
        rascunhoFormulario: rascunho,
        retornoPreview: this.router.url,
      },
    });
  }

  private montarOrcamento(): Orcamento {
    const v = this.form.getRawValue();
    const itens: ItemOrcamento[] = v.itens.map((i) => {
      const largura = numero(i.comprimento);
      const altura = numero(i.altura);
      const profundidade = numero(i.profundidade);
      const volume = largura * altura * profundidade;
      const precoMadeiraM3 = numero(i.madeira);
      const madeira = volume * precoMadeiraM3;
      const insumos = numero(i.insumos);
      const maoDeObra = numero(i.maoDeObra);
      const nome = i.nome.trim();
      const descricao = i.descricao.trim();

      return {
        descricao: descricao ? `${nome}: ${descricao}` : nome,
        med_largura: largura,
        med_altura: altura,
        med_profundidade: profundidade,
        metro_movel3: arredondar(volume, 3),
        material_por_metro3: precoMadeiraM3,
        insumos,
        taxa_mao_de_obra: maoDeObra,
        valor: arredondar(madeira + insumos + maoDeObra),
      };
    });

    return {
      nome_projeto: v.projeto.trim(),
      data_orcamento: this.hojeIso(),
      cliente: v.cliente.trim(),
      prazo_de_entrega: v.prazo.trim(),
      valor_total: arredondar(itens.reduce((soma, item) => soma + item.valor, 0)),
      status: this.orcamentoOriginal?.status ?? this.statusInicial,
      itens,
      arquiteto: v.arquiteto.trim(),
    };
  }

  /** Valida os campos e cria ou atualiza o documento no Firestore. */
  async salvar(): Promise<void> {
    this.erro = '';

    if (this.carregando || !this.orcamentoOriginal && this.orcamentoId) {
      this.erro = 'Aguarde o carregamento do orçamento antes de salvar.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro = 'Preencha cliente, projeto, prazo e os dados de cada móvel (medidas só com números).';
      return;
    }

    const orcamento = this.montarOrcamento();
    this.salvando = true;
    try {
      if (this.orcamentoId) {
        await this.service.atualizarOrcamento(this.orcamentoId, orcamento);
        this.service.limparRascunho(this.orcamentoId);
      } else {
        await this.service.criarOrcamento(orcamento);
      }
      await this.router.navigate(['/dashboard']);
    } catch (erro) {
      console.error('Erro ao salvar o orçamento:', errorCode(erro));
      this.erro = 'Não foi possível salvar o orçamento. Tente novamente.';
    } finally {
      this.salvando = false;
    }
  }

  private hojeIso(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}
