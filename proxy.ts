import { NextRequest, NextResponse } from 'next/server'
import { decryptSession } from '@/lib/session'

const PUBLIC = ['/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const token = request.cookies.get('session')?.value

  if (!token) return NextResponse.redirect(new URL('/login', request.url))

  try {
    await decryptSession(token)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)'],
}
