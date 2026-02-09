"use client"

import { useState } from 'react'
import Script from 'next/script' // Usamos el componente nativo
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const BankConnect = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fintocReady, setFintocReady] = useState(false);

  // Verificamos que la llave exista (para debug)
  const publicKey = process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY;

  const handleSuccess = async (exchangeToken: string) => {
    setIsLoading(true);
    try {
      console.log("✅ Token recibido:", exchangeToken);
      // Aquí simulamos la conexión exitosa
      router.push('/'); 
    } catch (error) {
      console.error("Error conectando banco:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const openFintoc = () => {
    if (!publicKey) {
      alert("Error: No se encontró la Public Key de Fintoc.");
      return;
    }

    if (!(window as any).Fintoc) {
      alert("El widget aún está cargando. Intenta de nuevo en 2 segundos.");
      return;
    }

    console.log("🚀 Iniciando Fintoc con Key:", publicKey.substring(0, 10) + "...");

    const widget = (window as any).Fintoc.create({
      publicKey: publicKey,
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
    <>
      {/* Carga limpia del script compatible con Vercel */}
      <Script 
        src="https://js.fintoc.com/v1/" 
        strategy="lazyOnload"
        onLoad={() => {
          console.log("✅ Fintoc Script Cargado Correctamente");
          setFintocReady(true);
        }}
      />

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
    </>
  )
}

export default BankConnect