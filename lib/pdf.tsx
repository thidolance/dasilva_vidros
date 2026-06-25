import {
  Document, Page, Text, View, StyleSheet, Font, Image as PDFImage,
} from '@react-pdf/renderer'
import path from 'path'
import { Orcamento } from './types'
import { formatBRL, formatDate, formatNumeroOrcamento } from './utils'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  empresa: {
    gap: 2,
  },
  empresaLogo: {
    width: 120,
    height: 48,
    objectFit: 'contain',
  },
  empresaSub: {
    fontSize: 9,
    color: '#6b7280',
  },
  orcamentoInfo: {
    alignItems: 'flex-end',
    gap: 2,
  },
  orcamentoNumero: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  },
  orcamentoData: {
    fontSize: 9,
    color: '#6b7280',
  },
  clienteBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  clienteLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  clienteNome: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  clienteTel: {
    fontSize: 9,
    color: '#4b5563',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    borderRadius: 4,
    padding: '6 8',
    marginBottom: 2,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: '5 8',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableText: {
    fontSize: 9,
    color: '#374151',
  },
  colDescricao: { flex: 3 },
  colDim: { flex: 1.2, textAlign: 'right' },
  colQtd: { width: 32, textAlign: 'center' },
  colArea: { flex: 1, textAlign: 'right' },
  colPreco: { flex: 1.2, textAlign: 'right' },
  colTotal: { flex: 1.4, textAlign: 'right' },
  totaisBox: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  totaisRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 2,
  },
  totaisLabel: {
    fontSize: 9,
    color: '#6b7280',
    width: 80,
    textAlign: 'right',
  },
  totaisValue: {
    fontSize: 9,
    width: 80,
    textAlign: 'right',
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#2563eb',
    borderRadius: 4,
    padding: '6 10',
    marginTop: 4,
    gap: 8,
  },
  totalFinalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    width: 80,
    textAlign: 'right',
  },
  totalFinalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    width: 80,
    textAlign: 'right',
  },
  observacoesBox: {
    marginTop: 24,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  observacoesLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  observacoesText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#9ca3af',
  },
  statusBadge: {
    padding: '3 8',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
})

export function OrcamentoPDF({ orcamento }: { orcamento: Orcamento }) {
  const isFechado = orcamento.status === 'fechado'

  // Monta o endereço em uma linha, ignorando campos vazios (orçamentos antigos)
  const ruaNum = [orcamento.endereco, orcamento.numeroEnd].filter(Boolean).join(', ')
  const cidadeUf = [orcamento.cidade, orcamento.uf].filter(Boolean).join('/')
  const linhaEndereco = [ruaNum, orcamento.bairro, cidadeUf, orcamento.cep]
    .filter(Boolean)
    .join(' • ')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.empresa}>
            <PDFImage
              style={styles.empresaLogo}
              src={path.join(process.cwd(), 'public', 'logo.png')}
            />
            <Text style={styles.empresaSub}>Vidros • Espelhos • Temperados</Text>
          </View>
          <View style={styles.orcamentoInfo}>
            <Text style={styles.orcamentoNumero}>
              Orçamento #{formatNumeroOrcamento(orcamento.numero)}
            </Text>
            <Text style={styles.orcamentoData}>
              Data: {formatDate(orcamento.data)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: isFechado ? '#d1fae5' : '#fef9c3' }]}>
              <Text style={[styles.statusText, { color: isFechado ? '#065f46' : '#713f12' }]}>
                {isFechado ? 'Fechado' : 'Em aberto'}
              </Text>
            </View>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.clienteBox}>
          <Text style={styles.clienteLabel}>Cliente</Text>
          <Text style={styles.clienteNome}>{orcamento.cliente}</Text>
          {orcamento.telefone ? (
            <Text style={styles.clienteTel}>Tel: {orcamento.telefone}</Text>
          ) : null}
          {linhaEndereco ? (
            <Text style={styles.clienteTel}>{linhaEndereco}</Text>
          ) : null}
        </View>

        {/* Tabela */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDescricao]}>Descrição</Text>
          <Text style={[styles.tableHeaderText, styles.colDim]}>L × A (cm)</Text>
          <Text style={[styles.tableHeaderText, styles.colQtd]}>Qtd</Text>
          <Text style={[styles.tableHeaderText, styles.colArea]}>Área m²</Text>
          <Text style={[styles.tableHeaderText, styles.colPreco]}>R$/m²</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
        </View>

        {orcamento.itens.map((item, i) => (
          <View key={item.id} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.tableText, styles.colDescricao]}>{item.descricao}</Text>
            <Text style={[styles.tableText, styles.colDim]}>
              {item.largura} × {item.altura}
            </Text>
            <Text style={[styles.tableText, styles.colQtd]}>{item.quantidade}</Text>
            <Text style={[styles.tableText, styles.colArea]}>{item.area.toFixed(4)}</Text>
            <Text style={[styles.tableText, styles.colPreco]}>{formatBRL(item.precoM2)}</Text>
            <Text style={[styles.tableText, styles.colTotal]}>{formatBRL(item.total)}</Text>
          </View>
        ))}

        {/* Totais */}
        <View style={styles.totaisBox}>
          <View style={styles.totaisRow}>
            <Text style={styles.totaisLabel}>Subtotal:</Text>
            <Text style={styles.totaisValue}>{formatBRL(orcamento.subtotal)}</Text>
          </View>
          {orcamento.desconto > 0 && (
            <View style={styles.totaisRow}>
              <Text style={styles.totaisLabel}>Desconto:</Text>
              <Text style={[styles.totaisValue, { color: '#dc2626' }]}>
                -{formatBRL(orcamento.desconto)}
              </Text>
            </View>
          )}
          <View style={styles.totalFinal}>
            <Text style={styles.totalFinalLabel}>TOTAL:</Text>
            <Text style={styles.totalFinalValue}>{formatBRL(orcamento.total)}</Text>
          </View>
        </View>

        {/* Observações */}
        {orcamento.observacoes ? (
          <View style={styles.observacoesBox}>
            <Text style={styles.observacoesLabel}>Observações</Text>
            <Text style={styles.observacoesText}>{orcamento.observacoes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Vidracaria Da Silva — Validade: 15 dias</Text>
          <Text style={styles.footerText}>
            Gerado em {new Date().toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
