import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware' // ✅ ruta relativa correcta

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Solo corre en rutas que realmente necesitan sesión.
     * Excluye: archivos estáticos, imágenes, fuentes, favicon,
     * rutas de API (manejan su propia auth) y callbacks de auth.
     */
    '/((?!_next/static|_next/image|favicon.ico|fonts|api/|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
}