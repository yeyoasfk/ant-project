"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const BankConnect = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fintocReady, setFintocReady] = useState(false);

  // 1. CARGA MANUAL DEL SCRIPT (Método infalible)
  useEffect(() => {
    // Si ya existe Fintoc en la ventana, no hacemos nada
    if ((window as any).Fintoc) {
      setFintocReady(true);
      console.log("✅ Fintoc ya estaba listo");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.fintoc.com/v1/";
    script.async = true;
    
    script.onload = () => {
      console.log("✅ Script de Fintoc inyectado y cargado");
      setFintocReady(true);
    };

    script.onerror = () => {
      console.error("❌ Error al cargar el script de Fintoc");
    };
    
    document.body.appendChild(script);

    // Limpieza al salir de la página
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSuccess = async (exchangeToken: string) => {
    setIsLoading(true);
    console.log("✅ ¡Éxito! Token recibido:", exchangeToken);
    
    // Simulación de éxito
    router.push('/'); 
  }

  const openFintoc = () => {
    // Verificación de seguridad
    if (!(window as any).Fintoc) {
      alert("El widget se está cargando... intenta en 2 segundos");
      return;
    }

    const widget = (window as any).Fintoc.create({
      publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY!,
      holderType: 'individual',
      product: 'movements',
      country: 'cl',
      onSuccess: function(response: any) {
        handleSuccess(response.exchange_token);
      },
      onExit: function() {
        console.log("El usuario cerró el widget");
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
          Cargando...
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