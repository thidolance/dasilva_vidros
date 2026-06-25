'use server'
import { redirect } from 'next/navigation'
import { validateCredentials } from '@/lib/auth'
import { encryptSession, setSessionCookie, deleteSessionCookie } from '@/lib/session'

export async function login(_: unknown, formData: FormData) {
  const password = formData.get('password') as string

  if (!validateCredentials(password)) {
    return { error: 'Senha incorreta.' }
  }

  const token = await encryptSession({ authenticated: true })
  await setSessionCookie(token)
  redirect('/')
}

export async function logout() {
  await deleteSessionCookie()
  redirect('/login')
}
