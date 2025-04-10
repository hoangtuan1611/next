// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get('token')?.value || ''

//   const publicPaths = ['/', 'login']

//   if (!token && !publicPaths.includes(req.nextUrl.pathname)) {
//     return NextResponse.redirect(new URL('/login', req.url))
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|login|$).*)'],
// }
