import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/sign-in', '/sign-up']

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname

  // ✅ Rutas públicas: NO llamamos a Supabase en absoluto
  // Solo dejamos pasar el request sin tocar cookies ni hacer auth
  const isPublicPath = PUBLIC_PATHS.some(p => path === p)
  if (isPublicPath) {
    return NextResponse.next({ request: { headers: request.headers } })
  }

  // ✅ Solo para rutas protegidas: verificamos sesión
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() es la única forma segura — no hay workaround aquí
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // No autenticado → redirige a login
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return response
}