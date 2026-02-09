"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const BankConnect = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fintocReady, setFintocReady] = useState(false);

  // 1. Cargar el script MANUALMENTE (Método Clásico)
  useEffect(() => {
    // Si ya existe, no lo recargamos
    if ((window as any).Fintoc) {
      setFintocReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.fintoc.com/v1/";
    script.async = true;
    
    script.onload = () => {
      setFintocReady(true);
    };

    document.body.appendChild(script);

    // Limpieza
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const openFintoc = () => {
    if (!(window as any).Fintoc) {
      return;
    }

    const widget = (window as any).Fintoc.create({
      publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY!,
      holderType: 'individual',
      product: 'movements',
      country: 'cl',
      onSuccess: function(response: any) {
        setIsLoading(true);
        console.log("✅ Token:", response.exchange_token);
        router.push('/'); 
      },
      onExit: function() {
        console.log("Widget cerrado");
      }
    });

    widget.open();
  }

  return (
    <button 
      onClick={openFintoc}
      disabled={isLoading || !fintocReady}
      className="flex items-center gap-2 rounded-lg bg-bankGradient px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin size-5" />
          Conectando...
        </>
      ) : (
        <>
          <Plus className="size-5" />
          Vincular Cuenta Bancaria
        </>
      )}
    </button>
  )
}

export default BankConnect