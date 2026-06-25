import {
  Document, Page, Text, View, StyleSheet, Image as PDFImage,
} from '@react-pdf/renderer'
import path from 'path'
import { Orcamento } from './types'
import { EMPRESA, GARANTIA_MESES } from './empresa'
import { formatBRL, formatDate, formatNumeroOrcamento } from './utils'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 48,
    paddingBottom: 70,
    color: '#1a1a1a',
    lineHeight: 1.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
  },
  logo: {
    width: 130,
    height: 52,
    objectFit: 'contain',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitulo: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  clausulaTitulo: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#1e3a8a',
  },
  paragrafo: {
    fontSize: 10,
    textAlign: 'justify',
    marginBottom: 4,
  },
  parteBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  parteLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  parteTexto: {
    fontSize: 9.5,
  },
  itemLinha: {
    fontSize: 9.5,
    marginBottom: 2,
    paddingLeft: 8,
  },
  totalLinha: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 6,
    color: '#1e3a8a',
  },
  assinaturas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 48,
  },
  assinaturaBloco: {
    width: '45%',
    alignItems: 'center',
  },
  assinaturaLinha: {
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    width: '100%',
    marginBottom: 4,
  },
  assinaturaNome: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  assinaturaSub: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  local: {
    fontSize: 10,
    marginTop: 28,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#9ca3af',
  },
})

function nomeMesPorExtenso(iso: string): string {
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ]
  const [ano, mes, dia] = iso.split('-')
  return `${dia} de ${meses[Number(mes) - 1]} de ${ano}`
}

export function ContratoPDF({ orcamento }: { orcamento: Orcamento }) {
  const ruaNum = [orcamento.endereco, orcamento.numeroEnd].filter(Boolean).join(', ')
  const cidadeUf = [orcamento.cidade, orcamento.uf].filter(Boolean).join('/')
  const enderecoCliente = [ruaNum, orcamento.bairro, cidadeUf, orcamento.cep]
    .filter(Boolean)
    .join(' - ') || 'Não informado'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <PDFImage
            style={styles.logo}
            src={path.join(process.cwd(), 'public', 'logo.png')}
          />
        </View>

        <Text style={styles.titulo}>
          CONTRATO DE FORNECIMENTO E INSTALAÇÃO DE VIDROS
        </Text>
        <Text style={styles.subtitulo}>
          Referente ao Orçamento nº {formatNumeroOrcamento(orcamento.numero)}
        </Text>

        {/* Partes */}
        <View style={styles.parteBox}>
          <Text style={styles.parteLabel}>Contratada</Text>
          <Text style={styles.parteTexto}>
            {EMPRESA.nome}, inscrita no CNPJ sob o nº {EMPRESA.cnpj}, com sede na{' '}
            {EMPRESA.endereco}, e-mail {EMPRESA.email}, neste ato representada por{' '}
            {EMPRESA.responsavel}.
          </Text>
        </View>

        <View style={styles.parteBox}>
          <Text style={styles.parteLabel}>Contratante</Text>
          <Text style={styles.parteTexto}>
            {orcamento.cliente}, inscrito(a) no CPF/CNPJ sob o nº {orcamento.documento},
            {orcamento.telefone ? ` telefone ${orcamento.telefone},` : ''} residente/estabelecido(a) em{' '}
            {enderecoCliente}.
          </Text>
        </View>

        <Text style={styles.paragrafo}>
          As partes acima identificadas têm, entre si, justo e acordado o presente Contrato de
          Fornecimento e Instalação de Vidros, que se regerá pelas cláusulas e condições seguintes.
        </Text>

        {/* Cláusula 1 - Objeto */}
        <Text style={styles.clausulaTitulo}>CLÁUSULA 1ª — DO OBJETO</Text>
        <Text style={styles.paragrafo}>
          O presente contrato tem por objeto o fornecimento e a instalação, pela CONTRATADA, dos
          materiais e serviços abaixo discriminados, conforme especificações acordadas entre as partes:
        </Text>
        {orcamento.itens.map((item, i) => (
          <Text key={item.id} style={styles.itemLinha}>
            {i + 1}. {item.descricao}
            {item.espessura ? ` — ${item.espessura}` : ''}
            {item.coloracao ? ` — ${item.coloracao}` : ''}
            {item.ladoImpresso ? ` — impresso ${item.ladoImpresso.toLowerCase()}` : ''}
            {' '}— {item.largura} × {item.altura} cm — Qtd: {item.quantidade} — {formatBRL(item.total)}
          </Text>
        ))}

        {/* Cláusula 2 - Valor */}
        <Text style={styles.clausulaTitulo}>CLÁUSULA 2ª — DO VALOR E PAGAMENTO</Text>
        <Text style={styles.paragrafo}>
          Pelo fornecimento e instalação do objeto deste contrato, a CONTRATANTE pagará à CONTRATADA
          o valor total de {formatBRL(orcamento.total)}
          {orcamento.desconto > 0 ? ` (já considerado desconto de ${formatBRL(orcamento.desconto)})` : ''},
          a ser quitado na forma combinada entre as partes.
        </Text>
        <Text style={styles.totalLinha}>VALOR TOTAL: {formatBRL(orcamento.total)}</Text>

        {/* Cláusula 3 - Prazo */}
        <Text style={styles.clausulaTitulo}>CLÁUSULA 3ª — DO PRAZO DE ENTREGA</Text>
        <Text style={styles.paragrafo}>
          A CONTRATADA compromete-se a entregar e instalar o objeto deste contrato no prazo de{' '}
          {orcamento.prazoEntrega || 'a combinar'}, contados a partir da confirmação do pedido e do
          pagamento da entrada, salvo motivo de força maior devidamente justificado.
        </Text>

        {/* Cláusula 4 - Garantia */}
        <Text style={styles.clausulaTitulo}>CLÁUSULA 4ª — DA GARANTIA</Text>
        <Text style={styles.paragrafo}>
          A CONTRATADA oferece garantia de {GARANTIA_MESES} (seis) meses sobre os serviços de
          instalação e eventuais defeitos de fabricação, contados a partir da data de entrega. A
          garantia não cobre danos decorrentes de mau uso, impactos, acidentes ou intervenções de
          terceiros.
        </Text>

        {/* Cláusula 5 - Obrigações */}
        <Text style={styles.clausulaTitulo}>CLÁUSULA 5ª — DAS OBRIGAÇÕES</Text>
        <Text style={styles.paragrafo}>
          A CONTRATADA obriga-se a executar os serviços com zelo e qualidade, empregando materiais
          adequados. A CONTRATANTE obriga-se a fornecer condições de acesso ao local da instalação e a
          efetuar os pagamentos nas datas acordadas.
        </Text>

        {/* Cláusula 6 - Foro */}
        <Text style={styles.clausulaTitulo}>CLÁUSULA 6ª — DO FORO</Text>
        <Text style={styles.paragrafo}>
          Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro
          da comarca de Curitiba/PR, com renúncia a qualquer outro, por mais privilegiado que seja.
        </Text>

        <Text style={styles.paragrafo}>
          E, por estarem assim justas e contratadas, firmam o presente instrumento em duas vias de
          igual teor.
        </Text>

        <Text style={styles.local}>
          Curitiba, {nomeMesPorExtenso(orcamento.data)}.
        </Text>

        {/* Assinaturas */}
        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <View style={styles.assinaturaLinha} />
            <Text style={styles.assinaturaNome}>{EMPRESA.nome}</Text>
            <Text style={styles.assinaturaSub}>CONTRATADA</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <View style={styles.assinaturaLinha} />
            <Text style={styles.assinaturaNome}>{orcamento.cliente}</Text>
            <Text style={styles.assinaturaSub}>CONTRATANTE</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {EMPRESA.nome} — CNPJ {EMPRESA.cnpj}
          </Text>
          <Text style={styles.footerText}>
            Contrato gerado em {new Date().toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
