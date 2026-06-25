'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, CheckCircle, DollarSign, Target } from 'lucide-react'
import { listarOrcamentosUltimosMeses } from '@/lib/firestore'
import { Orcamento } from '@/lib/types'
import { formatBRL } from '@/lib/utils'
import { GraficoFechados } from '@/components/graficos/GraficoFechados'
import { GraficoValores } from '@/components/graficos/GraficoValores'
import { GraficoStatus } from '@/components/graficos/GraficoStatus'
import { Card } from '@/components/ui/Card'

export default function GraficosPage() {
  const router = useRouter()
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)

  const hoje = new Date()
  const mes = hoje.getMonth() + 1
  const ano = hoje.getFullYear()

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const dados = await listarOrcamentosUltimosMeses(6)
      setOrcamentos(dados)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const mesStr = String(mes).padStart(2, '0')
  const doMes = orcamentos.filter((o) => o.data.startsWith(`${ano}-${mesStr}`))
  const fechadosMes = doMes.filter((o) => o.status === 'fechado')
  const abertosMes = doMes.filter((o) => o.status === 'aberto')
  const totalFechadoMes = fechadosMes.reduce((s, o) => s + o.total, 0)
  const ticketMedio = fechadosMes.length > 0 ? totalFechadoMes / fechadosMes.length : 0

  const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-semibold text-gray-900">Dashboard</h1>
          <span className="text-sm text-gray-400">
            {MESES[mes - 1]} {ano}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Cards do mês */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Fechados no mês</p>
                <p className="text-2xl font-bold text-emerald-600">{fechadosMes.length}</p>
              </div>
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Em aberto</p>
                <p className="text-2xl font-bold text-amber-600">{abertosMes.length}</p>
              </div>
              <Target size={18} className="text-amber-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total fechado</p>
                <p className="text-lg font-bold text-blue-600">{formatBRL(totalFechadoMes)}</p>
              </div>
              <DollarSign size={18} className="text-blue-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ticket médio</p>
                <p className="text-lg font-bold text-violet-600">{formatBRL(ticketMedio)}</p>
              </div>
              <TrendingUp size={18} className="text-violet-400" />
            </div>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            Carregando dados...
          </div>
        ) : (
          <>
            {/* Gráfico de barras: fechados por mês */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Orçamentos por mês (últimos 6 meses)
              </h2>
              <GraficoFechados orcamentos={orcamentos} />
            </Card>

            {/* Gráfico de linha: valores */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Valor total fechado por mês
              </h2>
              <GraficoValores orcamentos={orcamentos} />
            </Card>

            {/* Gráfico donut: status do mês */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Status — {MESES[mes - 1]} {ano}
              </h2>
              <GraficoStatus orcamentos={orcamentos} mes={mes} ano={ano} />
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
