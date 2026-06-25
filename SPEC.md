# DaSilva Vidros — Especificação do Projeto

Sistema web de orçamentos para vidracaria. Gera, lista, edita e exporta orçamentos em PDF, com dashboard de fechamentos mensais.

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 15 |
| UI | React | 19 |
| Linguagem | TypeScript | 5 |
| Estilo | Tailwind CSS | 4 |
| Banco de dados | Firebase Firestore | 11 |
| Autenticação | JWT custom (jose) | 6 |
| Gráficos | @visactor/react-vchart | 2 |
| PDF | @react-pdf/renderer | 4 |
| Ícones | lucide-react | — |
| Utilitários | clsx, tailwind-merge, zod | — |
| Runtime Node | 20.x | — |
| Deploy | Vercel | projeto: `dasilva-vidros` |

---

## Estrutura de Pastas

```
dasilva_vidros/
├── app/
│   ├── layout.tsx              # RootLayout
│   ├── page.tsx                # Lista de orçamentos (60 dias)
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx
│   ├── graficos/
│   │   └── page.tsx            # Dashboard de gráficos
│   ├── orcamento/
│   │   ├── novo/
│   │   │   └── page.tsx        # Novo orçamento
│   │   └── [id]/
│   │       └── page.tsx        # Editar orçamento
│   ├── actions/
│   │   └── auth.ts
│   └── api/
│       └── pdf/
│           └── [id]/
│               └── route.ts    # GET /api/pdf/[id] — gera PDF
├── components/
│   ├── login-form.tsx
│   ├── OrcamentoCard.tsx       # Card da lista com ações
│   ├── OrcamentoForm.tsx       # Formulário de criação/edição
│   ├── TabelaItens.tsx         # Tabela de itens do orçamento
│   ├── StatusBadge.tsx         # Badge aberto/fechado
│   ├── graficos/
│   │   ├── GraficoFechados.tsx     # Barras: fechados por mês
│   │   ├── GraficoValores.tsx      # Linha: valor total por mês
│   │   └── GraficoStatus.tsx       # Donut: aberto vs fechado
│   └── ui/
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── button.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/
│   ├── firebase.ts             # Inicialização Firebase
│   ├── firestore.ts            # CRUD de orçamentos
│   ├── types.ts                # Interfaces TypeScript
│   ├── auth.ts                 # validateCredentials()
│   ├── session.ts              # JWT (jose)
│   ├── pdf.tsx                 # Template @react-pdf/renderer
│   └── utils.ts                # cn(), formatBRL(), calcArea()
├── public/
│   └── logo.png
├── CLAUDE.md
├── SPEC.md
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Autenticação

- Sem Firebase Auth — autenticação própria com usuário/senha
- Usuário hardcoded via variável de ambiente: `AUTH_PASSWORD`
- Sessão: JWT HS256 com `SESSION_SECRET`, cookie `httpOnly`
- Duração: 7 dias
- Proteção via middleware

### Variáveis de Ambiente

```env
SESSION_SECRET=<string aleatória longa>
AUTH_PASSWORD=<senha>
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## Firebase / Firestore

Projeto a criar: `dasilvavidros`

### Coleções

| Coleção | Descrição | Campos principais |
|---|---|---|
| `orcamentos` | Orçamentos da vidracaria | ver modelo abaixo |
| `contador` | Sequência de número de orçamento | `doc: 'orcamento' → { ultimo: number }` |

### Modelo de Orçamento

```typescript
interface Orcamento {
  id: string               // Firestore document ID
  numero: number           // Sequencial (001, 002, ...)
  cliente: string          // Nome do cliente
  telefone?: string        // Telefone do cliente
  data: string             // ISO date (YYYY-MM-DD)
  itens: ItemOrcamento[]
  subtotal: number         // Soma dos itens
  desconto: number         // Desconto em R$
  total: number            // subtotal - desconto
  observacoes?: string
  status: 'aberto' | 'fechado'
  createdAt: Timestamp
  updatedAt: Timestamp
}

interface ItemOrcamento {
  id: string
  descricao: string        // Ex: "Vidro temperado 8mm"
  largura: number          // em cm
  altura: number           // em cm
  quantidade: number
  precoM2: number          // Preço por m²
  area: number             // (largura * altura) / 10000  [m²]
  total: number            // area * quantidade * precoM2
}
```

---

## Páginas

### `/` — Lista de Orçamentos

- Orçamentos dos últimos 60 dias, ordenados por data DESC
- Filtro por status: Todos / Abertos / Fechados
- Busca por nome do cliente
- Por orçamento: número, cliente, data, total, status
- Ações inline: Editar, Marcar como Fechado, Baixar PDF, Excluir

### `/orcamento/novo` — Novo Orçamento

- Form com: Cliente, Telefone, Data, Observações
- Tabela de itens dinâmica (adicionar/remover linha)
- Por item: Descrição, Largura (cm), Altura (cm), Qtd, Preço/m²
- Cálculo automático de área e total por item
- Campo de Desconto (R$)
- Totais: Subtotal, Desconto, Total
- Botão Salvar + Baixar PDF

### `/orcamento/[id]` — Editar Orçamento

- Mesma interface do novo
- Carrega dados existentes
- Salvar alterações
- Marcar como Fechado / Reabrir
- Baixar PDF

### `/graficos` — Dashboard

- Filtro de período (mês/ano)
- Cards: Total fechados no mês, Valor total fechado, Ticket médio, Total abertos
- Gráfico de barras: Orçamentos fechados por mês (últimos 6 meses)
- Gráfico de linha: Valor total fechado por mês (últimos 6 meses)
- Gráfico donut: Proporção Aberto vs Fechado (mês atual)

---

## PDF

Gerado via `@react-pdf/renderer` no servidor.

### Layout do PDF

```
┌────────────────────────────────────────────┐
│  VIDRACARIA DA SILVA          Orçamento #001│
│  [endereço / telefone]        Data: 25/06/26│
├────────────────────────────────────────────┤
│  Cliente: João da Silva                     │
│  Telefone: (11) 99999-9999                  │
├──────┬──────────────────┬──────┬─────┬─────┤
│  Qtd │ Descrição        │  m²  │ /m² │Total│
├──────┼──────────────────┼──────┼─────┼─────┤
│    2 │ Vidro temp. 8mm  │ 1.20 │ 180 │ 432 │
│    1 │ Espelho 4mm      │ 0.60 │ 150 │  90 │
├──────┴──────────────────┴──────┴─────┼─────┤
│                             Subtotal │ 522 │
│                              Desconto│  22 │
│                                TOTAL │ 500 │
└─────────────────────────────────────┴─────┘
│ Observações: ...                           │
│                                            │
│ Validade: 15 dias                          │
└────────────────────────────────────────────┘
```

---

## Padrões de Código

- Todos os componentes client-side têm `'use client'`
- Server Actions têm `'use server'`
- Formatação de moeda: `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`
- Carregamento: estado `loading` com spinner
- Paleta: blue-600 (primário), emerald (fechado), amber (aberto), red (cancelado)
- Número do orçamento: zero-padded 3 dígitos (001, 002, ...)
