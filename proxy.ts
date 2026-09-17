import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAppRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/communaute') ||
    request.nextUrl.pathname.startsWith('/planificateur') ||
    request.nextUrl.pathname.startsWith('/creer') ||
    request.nextUrl.pathname.startsWith('/bibliotheque') ||
    request.nextUrl.pathname.startsWith('/parametres') ||
    request.nextUrl.pathname.startsWith('/portail-parents') ||
    request.nextUrl.pathname.startsWith('/classe') ||
    request.nextUrl.pathname.startsWith('/ma-classe') ||
    request.nextUrl.pathname.startsWith('/aide') ||
    request.nextUrl.pathname.startsWith('/tableau-blanc')

  const isAuthRoute = request.nextUrl.pathname.startsWith('/connexion') ||
    request.nextUrl.pathname.startsWith('/inscription')

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/connexion'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
