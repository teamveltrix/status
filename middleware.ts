import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session && !pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
