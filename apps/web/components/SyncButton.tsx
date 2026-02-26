"use client"

import { useState } from 'react';
import { RefreshCw, CheckCircle2, Clock, X } from 'lucide-react';
import { forceBankSync } from '@/lib/actions/bank.actions';
import { useRouter } from 'next/navigation';

export default function SyncButton({ linkToken }: { linkToken: string }) {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'waiting' | 'error'>('idle');
  const router = useRouter();

  const handleSync = async () => {
    setStatus('syncing');

    try {
      // 1. Enviamos la orden "only_last" a Fintoc
      const res = await forceBankSync(linkToken);
      
      if (res.success) {
        // 2. Cambiamos el estado a "Esperando" (ya que toma 1 a 3 minutos)
        setStatus('waiting');
        
        // 3. Opcional: Recargamos la página automáticamente después de 2 minutos (120,000 ms)
        // para intentar ver si Fintoc ya terminó de traer los datos.
        setTimeout(() => {
          router.refresh();
          setStatus('idle'); // Volvemos al estado normal
        }, 120000); 

      } else {
        setStatus('error');
        alert("No se pudo iniciar la sincronización. Recuerda que solo puedes hacerlo cada 5 minutos.");
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={status !== 'idle'}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-13 md:text-14 font-semibold transition-all shadow-lg ${
        status === 'waiting'
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
          : status === 'error'
          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
          : 'bg-[#3b174d]/80 text-white border border-[#653584]/50 hover:bg-[#653584]/80'
      } disabled:opacity-80`}
    >
      {status === 'waiting' ? (
        <>
          <Clock className="size-4 animate-pulse" />
          Procesando (Toma ~2 min)
        </>
      ) : status === 'error' ? (
        <>
          <X className="size-4" />
          Error al conectar
        </>
      ) : (
        <>
          <RefreshCw className={`size-4 ${status === 'syncing' ? 'animate-spin' : ''}`} />
          {status === 'syncing' ? 'Iniciando...' : 'Sincronizar ahora'}
        </>
      )}
    </button>
  );
}