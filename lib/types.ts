import { Timestamp } from 'firebase/firestore'

export interface ItemOrcamento {
  id: string
  descricao: string
  largura: number   // cm
  altura: number    // cm
  quantidade: number
  precoM2: number   // R$ por m²
  area: number      // m² calculado
  total: number     // calculado
}

export interface Orcamento {
  id: string
  numero: number
  cliente: string
  telefone: string
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
