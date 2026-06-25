'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Download, CheckCircle, Trash2, RotateCcw } from 'lucide-react'
import { Orcamento } from '@/lib/types'
import { formatBRL, formatDate, formatNumeroOrcamento } from '@/lib/utils'
import { fecharOrcamento, reabrirOrcamento, excluirOrcamento } from '@/lib/firestore'
import { StatusBadge } from './StatusBadge'

export function OrcamentoCard({
  orcamento,
  onRefresh,
}: {
  orcamento: Orcamento
  onRefresh: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function handleFechar() {
    if (!confirm('Marcar este orçamento como fechado?')) return
    setLoading(true)
    try {
      await fecharOrcamento(orcamento.id)
      onRefresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleReabrir() {
    setLoading(true)
    try {
      await reabrirOrcamento(orcamento.id)
      onRefresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleExcluir() {
    if (!confirm(`Excluir orçamento #${formatNumeroOrcamento(orcamento.numero)}?`)) return
    setLoading(true)
    try {
      await excluirOrcamento(orcamento.id)
      onRefresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/pdf/${orcamento.id}`)
      if (!res.ok) throw new Error('Erro ao gerar PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orcamento-${formatNumeroOrcamento(orcamento.numero)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-blue-600">
              #{formatNumeroOrcamento(orcamento.numero)}
            </span>
            <StatusBadge status={orcamento.status} />
          </div>
          <p className="font-semibold text-gray-900 truncate">{orcamento.cliente}</p>
          {orcamento.telefone && (
            <p className="text-xs text-gray-400">{orcamento.telefone}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{formatDate(orcamento.data)}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-gray-900">{formatBRL(orcamento.total)}</p>
          <p className="text-xs text-gray-400">{orcamento.itens.length} item(s)</p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => router.push(`/orcamento/${orcamento.id}`)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Pencil size={12} />
          Editar
        </button>

        {orcamento.status === 'aberto' ? (
          <button
            onClick={handleFechar}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCircle size={12} />
            Fechar
          </button>
        ) : (
          <button
            onClick={handleReabrir}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RotateCcw size={12} />
            Reabrir
          </button>
        )}

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <Download size={12} />
          {downloading ? 'PDF...' : 'PDF'}
        </button>

        <button
          onClick={handleExcluir}
          disabled={loading}
          className="ml-auto flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
