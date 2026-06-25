'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Download, Search, FileText } from 'lucide-react'
import { ItemOrcamento, OrcamentoInput } from '@/lib/types'
import {
  calcItemTotal, formatBRL, todayISO, buscarCEP,
  ESPESSURAS, COLORACOES, LADOS_IMPRESSAO,
} from '@/lib/utils'
import { criarOrcamento, atualizarOrcamento } from '@/lib/firestore'

function novoItem(): ItemOrcamento {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    descricao: '',
    espessura: '',
    coloracao: '',
    ladoImpresso: '',
    largura: 0,
    altura: 0,
    quantidade: 1,
    valor: 0,
    total: 0,
  }
}

interface Props {
  orcamentoId?: string
  initialData?: Partial<OrcamentoInput & { id: string; numero: number }>
}

export function OrcamentoForm({ orcamentoId, initialData }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [emitindo, setEmitindo] = useState(false)

  const [cliente, setCliente] = useState(initialData?.cliente ?? '')
  const [telefone, setTelefone] = useState(initialData?.telefone ?? '')
  const [documento, setDocumento] = useState(initialData?.documento ?? '')
  const [prazoEntrega, setPrazoEntrega] = useState(initialData?.prazoEntrega ?? '')
  const [cep, setCep] = useState(initialData?.cep ?? '')
  const [endereco, setEndereco] = useState(initialData?.endereco ?? '')
  const [numeroEnd, setNumeroEnd] = useState(initialData?.numeroEnd ?? '')
  const [bairro, setBairro] = useState(initialData?.bairro ?? '')
  const [cidade, setCidade] = useState(initialData?.cidade ?? '')
  const [uf, setUf] = useState(initialData?.uf ?? '')
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [data, setData] = useState(initialData?.data ?? todayISO())
  const [observacoes, setObservacoes] = useState(initialData?.observacoes ?? '')
  const [desconto, setDesconto] = useState(initialData?.desconto ?? 0)
  const [itens, setItens] = useState<ItemOrcamento[]>(
    initialData?.itens?.length ? initialData.itens : [novoItem()],
  )

  const recalcItem = useCallback(
    (id: string, campo: keyof ItemOrcamento, valor: number | string) => {
      setItens((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          const updated = { ...item, [campo]: valor }
          const total = calcItemTotal(Number(updated.valor), Number(updated.quantidade))
          return { ...updated, total }
        }),
      )
    },
    [],
  )

  const addItem = () => setItens((prev) => [...prev, novoItem()])
  const removeItem = (id: string) => setItens((prev) => prev.filter((i) => i.id !== id))

  async function handleBuscarCep() {
    setBuscandoCep(true)
    try {
      const res = await buscarCEP(cep)
      if (!res) {
        alert('CEP não encontrado.')
        return
      }
      setEndereco(res.endereco)
      setBairro(res.bairro)
      setCidade(res.cidade)
      setUf(res.uf)
    } finally {
      setBuscandoCep(false)
    }
  }

  const subtotal = itens.reduce((s, i) => s + i.total, 0)
  const total = subtotal - desconto

  function buildInput(): OrcamentoInput {
    return {
      cliente, telefone, documento, prazoEntrega,
      cep, endereco, numeroEnd, bairro, cidade, uf,
      data, itens, subtotal, desconto, total, observacoes, status: 'aberto',
    }
  }

  async function handleSave() {
    if (!cliente.trim()) return alert('Informe o nome do cliente.')
    setSaving(true)
    try {
      if (orcamentoId) {
        await atualizarOrcamento(orcamentoId, buildInput())
        router.refresh()
      } else {
        const id = await criarOrcamento(buildInput())
        router.push(`/orcamento/${id}`)
      }
    } catch (err) {
      console.error(err)
      alert(`Erro ao salvar: ${err instanceof Error ? err.message : 'Verifique as configurações do Firebase.'}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDownloadPDF() {
    if (!orcamentoId) {
      alert('Salve o orçamento antes de baixar o PDF.')
      return
    }
    setDownloading(true)
    try {
      const res = await fetch(`/api/pdf/${orcamentoId}`)
      if (!res.ok) throw new Error('Erro ao gerar PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orcamento-${orcamentoId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  async function handleEmitirContrato() {
    if (!orcamentoId) {
      alert('Salve o orçamento antes de emitir o contrato.')
      return
    }
    if (!documento.trim()) {
      alert('Informe o CPF ou CNPJ do cliente para emitir o contrato.')
      return
    }
    setEmitindo(true)
    try {
      const res = await fetch(`/api/contrato/${orcamentoId}`)
      if (!res.ok) {
        const erro = await res.json().catch(() => null)
        throw new Error(erro?.error ?? 'Erro ao gerar contrato')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contrato-${orcamentoId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao gerar contrato')
    } finally {
      setEmitindo(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Dados do cliente */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Dados do cliente
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do cliente *
            </label>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF / CNPJ
              <span className="text-gray-400 font-normal"> (exigido p/ contrato)</span>
            </label>
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de entrega</label>
            <input
              type="text"
              value={prazoEntrega}
              onChange={(e) => setPrazoEntrega(e.target.value)}
              placeholder="Ex: 30 dias úteis"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Endereço */}
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-3">
          Endereço
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onBlur={() => cep.replace(/\D/g, '').length === 8 && handleBuscarCep()}
                placeholder="00000-000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleBuscarCep}
                disabled={buscandoCep}
                className="shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors disabled:opacity-50"
                title="Buscar CEP"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder={buscandoCep ? 'Buscando...' : 'Rua, avenida...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
            <input
              type="text"
              value={numeroEnd}
              onChange={(e) => setNumeroEnd(e.target.value)}
              placeholder="123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Bairro"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Cidade"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
            <input
              type="text"
              value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SP"
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Itens */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Itens</h2>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            Adicionar item
          </button>
        </div>

        <div className="space-y-3">
          {itens.map((item, idx) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400">Item {idx + 1}</span>
                {itens.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Remover item"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Descrição */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                <input
                  type="text"
                  value={item.descricao}
                  onChange={(e) => recalcItem(item.id, 'descricao', e.target.value)}
                  placeholder="Ex: Box de banheiro, janela, porta..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Espessura, coloração, lado impresso */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Espessura</label>
                  <select
                    value={item.espessura}
                    onChange={(e) => recalcItem(item.id, 'espessura', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    {ESPESSURAS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Coloração</label>
                  <input
                    type="text"
                    list="coloracoes"
                    value={item.coloracao}
                    onChange={(e) => recalcItem(item.id, 'coloracao', e.target.value)}
                    placeholder="Incolor, bronze..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Vidro impresso</label>
                  <select
                    value={item.ladoImpresso}
                    onChange={(e) => recalcItem(item.id, 'ladoImpresso', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Não se aplica</option>
                    {LADOS_IMPRESSAO.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Largura, altura, qtd, valor, total */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Largura (cm)</label>
                  <input
                    type="number"
                    min="0"
                    value={item.largura || ''}
                    onChange={(e) => recalcItem(item.id, 'largura', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    min="0"
                    value={item.altura || ''}
                    onChange={(e) => recalcItem(item.id, 'altura', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Qtd</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => recalcItem(item.id, 'quantidade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Valor unit. (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.valor || ''}
                    onChange={(e) => recalcItem(item.id, 'valor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>
                  <div className="px-3 py-2 text-sm text-right font-semibold text-gray-900">
                    {formatBRL(item.total)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <datalist id="coloracoes">
          {COLORACOES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        {/* Totais */}
        <div className="mt-4 flex justify-end">
          <div className="space-y-1.5 w-56">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">{formatBRL(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Desconto (R$)</span>
              <div className="flex items-center gap-1">
                {desconto > 0 && <span className="text-red-500 font-medium">−</span>}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={desconto || ''}
                  onChange={(e) => setDesconto(Number(e.target.value))}
                  className={`w-24 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    desconto > 0 ? 'text-red-500 font-medium' : ''
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
              <span>TOTAL</span>
              <span className="text-blue-600">{formatBRL(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
          placeholder="Informações adicionais para o cliente..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-3 justify-end">
        {orcamentoId && (
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {downloading ? 'Gerando...' : 'Baixar PDF'}
          </button>
        )}
        {orcamentoId && (
          <button
            onClick={handleEmitirContrato}
            disabled={emitindo}
            title={!documento.trim() ? 'Preencha o CPF/CNPJ do cliente' : 'Emitir contrato'}
            className="flex items-center gap-2 px-4 py-2.5 border border-blue-300 bg-blue-50 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <FileText size={16} />
            {emitindo ? 'Gerando...' : 'Emitir Contrato'}
          </button>
        )}
        <button
          onClick={() => router.back()}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : orcamentoId ? 'Salvar alterações' : 'Criar orçamento'}
        </button>
      </div>
    </div>
  )
}
