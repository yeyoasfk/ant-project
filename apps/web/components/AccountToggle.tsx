"use client"

import { useTransition } from 'react'
import { toggleAccountVisibility } from '@/lib/actions/bank.actions'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AccountToggle({ accountId, isHidden }: { accountId: string, isHidden: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      // Si está oculta, le pasamos false (para mostrarla). Si está visible, true (para ocultarla).
      await toggleAccountVisibility(accountId, !isHidden);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all w-full justify-center border shadow-sm
        ${isHidden
          ? 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-gray-300'
          : 'bg-[#572371]/20 border-[#9d6dc0]/40 text-[#c084fc] hover:bg-[#572371]/40'
        }`}
    >
      {isPending ? (
        <><Loader2 className="size-4 animate-spin" /> Actualizando...</>
      ) : isHidden ? (
        <><EyeOff className="size-4" /> Cuenta Oculta</>
      ) : (
        <><Eye className="size-4" /> Cuenta Visible</>
      )}
    </button>
  )
}