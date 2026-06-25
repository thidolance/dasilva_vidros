'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, RotateCcw } from 'lucide-react'
import { buscarOrcamento, fecharOrcamento, reabrirOrcamento } from '@/lib/firestore'
import { Orcamento } from '@/lib/types'
import { OrcamentoForm } from '@/components/OrcamentoForm'
import { StatusBadge } from '@/components/StatusBadge'
import { formatNumeroOrcamento } from '@/lib/utils'

export default function EditarOrcamentoPage() {
  const params = useParams()
  const id = params.id as string
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  async function carregar() {
    const dados = await buscarOrcamento(id)
    setOrcamento(dados)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [id])

  async function handleToggleStatus() {
    if (!orcamento) return
    setToggling(true)
    try {
      if (orcamento.status === 'aberto') {
        await fecharOrcamento(id)
      } else {
        await reabrirOrcamento(id)
      }
      await carregar()
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Carregando...
      </div>
    )
  }

  if (!orcamento) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-4">
        <p>Orçamento não encontrado.</p>
        <Link href="/" className="text-blue-600 text-sm hover:underline">
          Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-gray-900">
                Orçamento #{formatNumeroOrcamento(orcamento.numero)}
              </h1>
              <StatusBadge status={orcamento.status} />
            </div>
          </div>
          <button
            onClick={handleToggleStatus}
            disabled={toggling}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50 ${
              orcamento.status === 'aberto'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {orcamento.status === 'aberto' ? (
              <>
                <CheckCircle size={14} />
                Marcar como fechado
              </>
            ) : (
              <>
                <RotateCcw size={14} />
                Reabrir
              </>
            )}
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <OrcamentoForm orcamentoId={id} initialData={orcamento} />
      </main>
    </div>
  )
}
