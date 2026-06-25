import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp, runTransaction,
} from 'firebase/firestore'
import { db } from './firebase'
import { Orcamento, OrcamentoInput } from './types'

const COL = 'orcamentos'
const CONTADOR_DOC = doc(db, 'contador', 'orcamento')

async function proximoNumero(): Promise<number> {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(CONTADOR_DOC)
    const ultimo = snap.exists() ? (snap.data().ultimo as number) : 0
    const proximo = ultimo + 1
    tx.set(CONTADOR_DOC, { ultimo: proximo })
    return proximo
  })
}

export async function criarOrcamento(input: OrcamentoInput): Promise<string> {
  const numero = await proximoNumero()
  const now = Timestamp.now()
  const ref = await addDoc(collection(db, COL), {
    ...input,
    numero,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function listarOrcamentos60Dias(): Promise<Orcamento[]> {
  const desde = new Date()
  desde.setDate(desde.getDate() - 60)
  const desde60 = desde.toISOString().split('T')[0]

  const q = query(
    collection(db, COL),
    where('data', '>=', desde60),
    orderBy('data', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Orcamento))
}

export async function listarOrcamentosPorMes(ano: number, mes: number): Promise<Orcamento[]> {
  const mesStr = String(mes).padStart(2, '0')
  const inicio = `${ano}-${mesStr}-01`
  const fim = `${ano}-${mesStr}-31`

  const q = query(
    collection(db, COL),
    where('data', '>=', inicio),
    where('data', '<=', fim),
    orderBy('data', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Orcamento))
}

export async function listarOrcamentosUltimosMeses(quantidade: number): Promise<Orcamento[]> {
  const desde = new Date()
  desde.setMonth(desde.getMonth() - quantidade)
  const inicio = `${desde.getFullYear()}-${String(desde.getMonth() + 1).padStart(2, '0')}-01`

  const q = query(
    collection(db, COL),
    where('data', '>=', inicio),
    orderBy('data', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Orcamento))
}

export async function buscarOrcamento(id: string): Promise<Orcamento | null> {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Orcamento
}

export async function atualizarOrcamento(id: string, dados: Partial<OrcamentoInput>): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...dados,
    updatedAt: Timestamp.now(),
  })
}

export async function fecharOrcamento(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    status: 'fechado',
    updatedAt: Timestamp.now(),
  })
}

export async function reabrirOrcamento(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    status: 'aberto',
    updatedAt: Timestamp.now(),
  })
}

export async function excluirOrcamento(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id))
}
