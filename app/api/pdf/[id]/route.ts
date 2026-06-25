import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { buscarOrcamento } from '@/lib/firestore'
import { OrcamentoPDF } from '@/lib/pdf'
import { createElement } from 'react'
import { formatNumeroOrcamento } from '@/lib/utils'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orcamento = await buscarOrcamento(id)

  if (!orcamento) {
    return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(createElement(OrcamentoPDF, { orcamento }) as any)

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="orcamento-${formatNumeroOrcamento(orcamento.numero)}.pdf"`,
    },
  })
}
