export interface ItemOrcamento {
  id_item?: string;
  descricao: string;
  med_largura: number;
  med_altura: number;
  med_profundidade: number;
  material_por_metro3: number;
  metro_movel3: number;
  insumos: number;
  taxa_mao_de_obra: number;
  valor: number;
}

export interface Orcamento {
  id_orcamento?: string;
  nome_projeto: string;
  data_orcamento: string;
  arquiteto?: string;
  cliente: string;
  prazo_de_entrega?: string;
  valor_total: number;
  status: string;
  itens: ItemOrcamento[];
}