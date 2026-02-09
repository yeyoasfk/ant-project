"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const BankConnect = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fintocReady, setFintocReady] = useState(false);

  // 1. Cargar el script MANUALMENTE al montar el componente
  useEffect(() => {
    // Verificamos si ya existe (usando 'any' para que TS no llore)
    if ((window as any).Fintoc) {
      setFintocReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.fintoc.com/v1/";
    script.async = true;
    script.onload = () => {
      console.log("✅ Script de Fintoc cargado");
      setFintocReady(true);
    };
    script.onerror = () => {
      console.error("❌ Error cargando script de Fintoc");
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSuccess = async (exchangeToken: string) => {
    setIsLoading(true);
    try {
      console.log("✅ Token recibido:", exchangeToken);
      alert(`Token recibido: ${exchangeToken}`); 
      // Aquí conectaremos con tu backend pronto...
      router.push('/'); 
    } catch (error) {
      console.error("Error conectando banco:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const openFintoc = () => {
    // Usamos (window as any) para evitar el error rojo que tenías
    if (!(window as any).Fintoc) {
      alert("Fintoc no está listo. Recarga la página.");
      return;
    }

    console.log("🚀 Abriendo Widget...");
    const widget = (window as any).Fintoc.create({
      publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY!,
      holderType: 'individual',
      product: 'movements',
      country: 'cl',
      onSuccess: function(response: any) {
        handleSuccess(response.exchange_token);
      },
      onExit: function() {
        console.log("Usuario cerró el widget");
      }
    });

    widget.open();
  }

  return (
    <button 
      onClick={openFintoc}
      disabled={isLoading || !fintocReady}
      className="flex items-center gap-2 rounded-lg bg-bankGradient px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin size-5" />
          Conectando...
        </>
      ) : !fintocReady ? (
        <>
          <Loader2 className="animate-spin size-5" />
          Cargando Widget...
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