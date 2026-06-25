'use client'
import { VChart } from '@visactor/react-vchart'
import { Orcamento } from '@/lib/types'

interface Props {
  orcamentos: Orcamento[]
}

function agruparValoresPorMes(orcamentos: Orcamento[]) {
  const meses: Record<string, number> = {}

  orcamentos
    .filter((o) => o.status === 'fechado')
    .forEach((o) => {
      const [ano, mes] = o.data.split('-')
      const key = `${mes}/${ano.slice(2)}`
      meses[key] = (meses[key] ?? 0) + o.total
    })

  return Object.entries(meses).map(([mes, total]) => ({ mes, total: Number(total.toFixed(2)) }))
}

export function GraficoValores({ orcamentos }: Props) {
  const dados = agruparValoresPorMes(orcamentos)

  const spec = {
    type: 'line',
    data: [{ id: 'data', values: dados }],
    xField: 'mes',
    yField: 'total',
    line: { style: { lineWidth: 2 } },
    point: { visible: true, style: { size: 6 } },
    area: { visible: true, style: { fillOpacity: 0.15 } },
    color: ['#2563eb'],
    axes: [
      { orient: 'bottom', label: { style: { fontSize: 11 } } },
      {
        orient: 'left',
        label: {
          style: { fontSize: 11 },
          formatMethod: (v: number) =>
            v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        },
      },
    ],
    tooltip: { visible: true },
  }

  return (
    <div style={{ height: 300 }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <VChart spec={spec as any} />
    </div>
  )
}
