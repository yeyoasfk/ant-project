"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react' // 👈 Importamos useState
import { LogOut, X, Check } from 'lucide-react'
import { createClient } from '../lib/supabase/client'
import { cn } from '../lib/utils'

const Footer = ({ user, type = 'desktop' }: { user: any, type?: 'mobile' | 'desktop' }) => {
  const router = useRouter();
  const supabase = createClient();
  const [showConfirm, setShowConfirm] = useState(false); // Estado para el modal

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-in');
  }

  return (
    <>
      <footer className="relative flex cursor-pointer items-center justify-between gap-2 py-4 sm:py-6">
          
          {/* INFORMACIÓN DEL USUARIO */}
          <div className={cn("flex flex-1 flex-col justify-center gap-0.5 sm:gap-1 min-w-0", type === 'mobile' ? '' : 'xl:flex')}>
              <h1 className="text-12 sm:text-14 truncate font-semibold text-gray-700 font-ibm-plex-serif">
                  {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-11 sm:text-12 truncate font-normal text-gray-500">
                  {user?.email}
              </p>
          </div>

          {/* BOTÓN DE SALIDA */}
          <div 
              className="relative size-9 sm:size-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-50 group transition-colors border border-transparent hover:border-red-100 flex-shrink-0"
              onClick={() => setShowConfirm(true)}
              title="Cerrar Sesión"
          >
              <LogOut className="size-4 sm:size-5 text-gray-500 group-hover:text-red-600 transition-colors" />
          </div>
      </footer>

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-xl bg-white p-4 sm:p-6 shadow-2xl border border-gray-100 scale-100 animate-in zoom-in-95 duration-200">
                
                <div className="flex flex-col gap-4 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
                        <LogOut className="size-6 text-red-600" />
                    </div>
                    
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">¿Cerrar Sesión?</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Tendrás que ingresar tus credenciales nuevamente para acceder.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {/* Botón Cancelar */}
                        <button 
                            onClick={() => setShowConfirm(false)}
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <X size={16} />
                            Cancelar
                        </button>

                        {/* Botón Confirmar */}
                        <button 
                            onClick={handleLogOut}
                            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
                        >
                            <Check size={16} />
                            Sí, salir
                        </button>
                    </div>
                </div>

            </div>
        </div>
      )}
    </>
  )
}

export default Footer