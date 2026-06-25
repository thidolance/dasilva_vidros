import { Timestamp } from 'firebase/firestore'

export interface ItemOrcamento {
  id: string
  descricao: string
  espessura: string    // 4mm, 6mm, 8mm, 10mm
  coloracao: string    // incolor, bronze, fumê, verde ou outro
  ladoImpresso: string // '', 'Deste lado', 'Lado oposto'
  largura: number      // cm
  altura: number       // cm
  quantidade: number
  valor: number        // valor unitário em R$
  total: number        // valor * quantidade
}

export interface Orcamento {
  id: string
  numero: number
  cliente: string
  telefone: string
  documento: string // CPF ou CNPJ do cliente (opcional; exigido p/ contrato)
  cep: string
  endereco: string  // rua/logradouro
  numeroEnd: string // número da casa
  bairro: string
  cidade: string
  uf: string
  prazoEntrega: string // ex: "30 dias úteis"
  data: string      // YYYY-MM-DD
  itens: ItemOrcamento[]
  subtotal: number
  desconto: number
  total: number
  observacoes: string
  status: 'aberto' | 'fechado'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type OrcamentoInput = Omit<Orcamento, 'id' | 'numero' | 'createdAt' | 'updatedAt'>
