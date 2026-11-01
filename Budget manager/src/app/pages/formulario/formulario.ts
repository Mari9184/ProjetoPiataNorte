import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MenuTop } from '../../component/menu-top/menu-top';
import { ItemOrcamento, Orcamento } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento';
 

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
 
@Component({
  imports: [MenuTop, RouterLink, ReactiveFormsModule],
  selector: 'app-formulario',
  standalone: true,
  styleUrl: './formulario.css',
  templateUrl: './formulario.html',
})
export class Formulario {
  private fb = inject(FormBuilder);
  private service = inject(OrcamentoService);
  private router = inject(Router);
 
  readonly statusInicial = 'Em produção';
 
  salvando = false;
  erro = '';
 

  form = this.fb.nonNullable.group({
    cliente: ['Ana Martins', Validators.required],
    arquiteto: ['Beatriz Costa'],
    projeto: ['Cozinha e sala - Apê Horizonte', Validators.required],
    pagamento: ['50% na aprovação e 50% na entrega e instalação.'], // ainda não existe no model
    prazo: ['35 dias úteis', Validators.required],
    itens: this.fb.nonNullable.array([
      this.novoItem({
        nome: 'Armário inferior - cozinha',
        descricao: 'Base inferior para cozinha com acabamento em MDF amadeirado.',
        comprimento: '3,00', altura: '0,90', profundidade: '0,60',
        madeira: 'R$ 2.700,00', insumos: 'R$ 520,00', maoDeObra: 'R$ 1.000,00',
      }),
      this.novoItem({
        nome: 'Painel com rack - sala',
        descricao: 'Painel vertical com rack para sala com acabamento em MDF amadeirado.',
        comprimento: '2,00', altura: '2,40', profundidade: '0,35',
        madeira: 'R$ 1.800,00', insumos: 'R$ 280,00', maoDeObra: 'R$ 700,00',
      }),
    ]),
  });
 
  get itens() {
    return this.form.controls.itens;
  }
 
  private novoItem(inicial: Partial<Record<string, string>> = {}) {
    return this.fb.nonNullable.group({
      nome: [inicial['nome'] ?? '', Validators.required],
      descricao: [inicial['descricao'] ?? ''],
      comprimento: [inicial['comprimento'] ?? '', [Validators.required, Validators.pattern(SO_NUMERO)]],
      altura: [inicial['altura'] ?? '', [Validators.required, Validators.pattern(SO_NUMERO)]],
      profundidade: [inicial['profundidade'] ?? '', [Validators.required, Validators.pattern(SO_NUMERO)]],
      madeira: [inicial['madeira'] ?? '', Validators.required],
      insumos: [inicial['insumos'] ?? '0'],
      maoDeObra: [inicial['maoDeObra'] ?? '0'],
    });
  }
 
  adicionarMovel() {
    this.itens.push(this.novoItem());
  }
 
  subtotal(indice: number): number {
    const v = this.itens.at(indice).getRawValue();
    return numero(v.madeira) + numero(v.insumos) + numero(v.maoDeObra);
  }
 
  brl(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }
 
  // AQui é o CREATE 
  async salvar() {
    this.erro = '';
 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro = 'Preencha cliente, projeto, prazo e os dados de cada móvel (medidas só com números).';
      return;
    }
 
    const v = this.form.getRawValue();
 
    const itens: ItemOrcamento[] = v.itens.map((i) => {
      const largura = numero(i.comprimento);
      const altura = numero(i.altura);
      const profundidade = numero(i.profundidade);
      const volume = largura * altura * profundidade;
      const madeira = numero(i.madeira);
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
        
        material_por_metro3: volume > 0 ? arredondar(madeira / volume) : 0,
        insumos,
        taxa_mao_de_obra: maoDeObra,
        valor: arredondar(madeira + insumos + maoDeObra),
      };
    });
 
    const orcamento: Orcamento = {
      nome_projeto: v.projeto.trim(),
      data_orcamento: this.hojeIso(),
      cliente: v.cliente.trim(),
      prazo_de_entrega: v.prazo.trim(),
      valor_total: arredondar(itens.reduce((soma, item) => soma + item.valor, 0)),
      status: this.statusInicial,
      itens,
    };
 
  
    const arquiteto = v.arquiteto.trim();
    if (arquiteto) orcamento.arquiteto = arquiteto;
 
    this.salvando = true;
    try {
      await this.service.criarOrcamento(orcamento);
      await this.router.navigate(['/dashboard']);
    } catch (erro) {
      console.error('Erro ao salvar o orçamento:', erro);
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