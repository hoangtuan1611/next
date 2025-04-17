import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface MyToken {
  name: string
  role: string
  exp: number
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value || ''

  const publicPaths = ['/', 'login']

  if (publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const decoded = jwtDecode<MyToken>(token)

    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (pathname.startsWith('/teacher') && decoded.role !== 'teacher') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  } catch (err) {
    console.error('Invalid token:', err)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|public|api/public|assets|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
