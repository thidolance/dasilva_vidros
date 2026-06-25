import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatNumeroOrcamento(numero: number): string {
  return String(numero).padStart(3, '0')
}

export function calcItemTotal(valor: number, quantidade: number): number {
  return Number((valor * quantidade).toFixed(2))
}

// Opções fixas para os campos de item.
export const ESPESSURAS = ['4mm', '6mm', '8mm', '10mm']
export const COLORACOES = ['Incolor', 'Bronze', 'Fumê', 'Verde']
export const LADOS_IMPRESSAO = ['Deste lado', 'Lado oposto']

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export interface EnderecoCEP {
  endereco: string
  bairro: string
  cidade: string
  uf: string
}

// Busca endereço pelo CEP via API pública ViaCEP (sem chave).
export async function buscarCEP(cep: string): Promise<EnderecoCEP | null> {
  const limpo = cep.replace(/\D/g, '')
  if (limpo.length !== 8) return null

  try {
    const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`)
    const data = await res.json()
    if (data.erro) return null
    return {
      endereco: data.logradouro ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
      uf: data.uf ?? '',
    }
  } catch {
    return null
  }
}
