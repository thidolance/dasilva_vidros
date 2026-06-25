'use client'
import { VChart } from '@visactor/react-vchart'
import { Orcamento } from '@/lib/types'

interface Props {
  orcamentos: Orcamento[]
  mes: number
  ano: number
}

export function GraficoStatus({ orcamentos, mes, ano }: Props) {
  const mesStr = String(mes).padStart(2, '0')
  const doMes = orcamentos.filter((o) => o.data.startsWith(`${ano}-${mesStr}`))

  const fechados = doMes.filter((o) => o.status === 'fechado').length
  const abertos = doMes.filter((o) => o.status === 'aberto').length

  const spec = {
    type: 'pie',
    data: [
      {
        id: 'data',
        values: [
          { tipo: 'Fechados', valor: fechados },
          { tipo: 'Em aberto', valor: abertos },
        ],
      },
    ],
    categoryField: 'tipo',
    valueField: 'valor',
    outerRadius: 0.8,
    innerRadius: 0.6,
    color: ['#10b981', '#f59e0b'],
    legends: { visible: true },
    label: { visible: true },
    tooltip: { visible: true },
  }

  if (doMes.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Nenhum orçamento neste mês
      </div>
    )
  }

  return (
    <div style={{ height: 300 }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <VChart spec={spec as any} />
    </div>
  )
}
