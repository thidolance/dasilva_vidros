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

export function calcArea(largura: number, altura: number): number {
  return Number(((largura * altura) / 10000).toFixed(4))
}

export function calcItemTotal(area: number, quantidade: number, precoM2: number): number {
  return Number((area * quantidade * precoM2).toFixed(2))
}

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
