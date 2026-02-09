import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✅ ESTE archivo exporta "updateSession", NO "middleware"
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/sign-in' || path === '/sign-up' || path.startsWith('/auth');

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (user && isPublicPath && !path.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}