"use client" // 👈 Esto es lo que Next.js exige

import dynamic from 'next/dynamic'

// Movemos la carga dinámica aquí
const BankConnect = dynamic(() => import('./BankConnect'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-400">
      Cargando botón...
    </div>
  )
})

export default function BankConnectWrapper() {
  return <BankConnect />
}