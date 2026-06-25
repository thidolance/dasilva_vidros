'use client'
import { VChart } from '@visactor/react-vchart'
import { Orcamento } from '@/lib/types'

interface Props {
  orcamentos: Orcamento[]
}

function agruparPorMes(orcamentos: Orcamento[]) {
  const meses: Record<string, { fechados: number; abertos: number }> = {}

  orcamentos.forEach((o) => {
    const [ano, mes] = o.data.split('-')
    const key = `${mes}/${ano.slice(2)}`
    if (!meses[key]) meses[key] = { fechados: 0, abertos: 0 }
    if (o.status === 'fechado') meses[key].fechados++
    else meses[key].abertos++
  })

  return Object.entries(meses).map(([mes, v]) => ({ mes, ...v }))
}

export function GraficoFechados({ orcamentos }: Props) {
  const dados = agruparPorMes(orcamentos)

  const spec = {
    type: 'bar',
    data: [{ id: 'data', values: dados }],
    xField: 'mes',
    yField: ['fechados', 'abertos'],
    seriesField: 'type',
    bar: { style: { cornerRadius: [4, 4, 0, 0] } },
    legends: { visible: true },
    color: ['#10b981', '#f59e0b'],
    axes: [
      { orient: 'bottom', label: { style: { fontSize: 11 } } },
      { orient: 'left', label: { style: { fontSize: 11 } } },
    ],
    tooltip: { visible: true },
    series: [
      { type: 'bar', dataKey: 'fechados', name: 'Fechados', color: '#10b981' },
      { type: 'bar', dataKey: 'abertos', name: 'Em aberto', color: '#f59e0b' },
    ],
  }

  return (
    <div style={{ height: 300 }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <VChart spec={spec as any} />
    </div>
  )
}
