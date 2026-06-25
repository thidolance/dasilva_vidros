'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, BarChart2, LogOut, Search, GlassWater } from 'lucide-react'
import { listarOrcamentos60Dias } from '@/lib/firestore'
import { Orcamento } from '@/lib/types'
import { OrcamentoCard } from '@/components/OrcamentoCard'
import { logout } from '@/app/actions/auth'

type Filtro = 'todos' | 'aberto' | 'fechado'

export default function HomePage() {
  const router = useRouter()
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busca, setBusca] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const dados = await listarOrcamentos60Dias()
      setOrcamentos(dados)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const filtrados = orcamentos
    .filter((o) => filtro === 'todos' || o.status === filtro)
    .filter((o) => !busca || o.cliente.toLowerCase().includes(busca.toLowerCase()))

  const totalAbertos = orcamentos.filter((o) => o.status === 'aberto').length
  const totalFechados = orcamentos.filter((o) => o.status === 'fechado').length
  const valorFechados = orcamentos
    .filter((o) => o.status === 'fechado')
    .reduce((s, o) => s + o.total, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GlassWater size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">DaSilva Vidros</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => router.push('/graficos')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BarChart2 size={15} />
              <span className="hidden sm:inline">Gráficos</span>
            </button>
            <button
              onClick={() => router.push('/orcamento/novo')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Novo orçamento</span>
              <span className="sm:hidden">Novo</span>
            </button>
            <form action={logout}>
              <button type="submit" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors" title="Sair">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
            <p className="text-xs text-gray-500 mb-1">Em aberto</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">{totalAbertos}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
            <p className="text-xs text-gray-500 mb-1">Fechados</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">{totalFechados}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
            <p className="text-xs text-gray-500 mb-1">Total fechado</p>
            <p className="text-sm sm:text-xl font-bold text-blue-600">
              {valorFechados.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            {(['todos', 'aberto', 'fechado'] as Filtro[]).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  filtro === f ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'todos' ? 'Todos' : f === 'aberto' ? 'Em aberto' : 'Fechados'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-3">
            Últimos 60 dias · {filtrados.length} orçamento(s)
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              Carregando orçamentos...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <p className="mb-3">Nenhum orçamento encontrado.</p>
              <button
                onClick={() => router.push('/orcamento/novo')}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={14} />
                Criar primeiro orçamento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtrados.map((o) => (
                <OrcamentoCard key={o.id} orcamento={o} onRefresh={carregar} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
