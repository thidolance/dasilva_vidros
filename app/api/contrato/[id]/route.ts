import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { buscarOrcamento } from '@/lib/firestore'
import { ContratoPDF } from '@/lib/contrato'
import { createElement } from 'react'
import { formatNumeroOrcamento } from '@/lib/utils'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orcamento = await buscarOrcamento(id)

  if (!orcamento) {
    return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
  }

  if (!orcamento.documento?.trim()) {
    return NextResponse.json(
      { error: 'CPF/CNPJ do cliente é obrigatório para emitir o contrato' },
      { status: 400 },
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(createElement(ContratoPDF, { orcamento }) as any)

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contrato-${formatNumeroOrcamento(orcamento.numero)}.pdf"`,
    },
  })
}
