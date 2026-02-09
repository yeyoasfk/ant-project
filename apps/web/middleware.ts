import { type NextRequest } from 'next/server'
import { updateSession } from '../web/lib/supabase/middleware' // <--- Importa del otro archivo

export async function middleware(request: NextRequest) {
  // ✅ ESTO ES LO QUE BUSCA NEXT.JS: Una función llamada "middleware"
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}