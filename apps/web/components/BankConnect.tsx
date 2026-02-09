"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const BankConnect = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Cargamos el script apenas el componente aparece en el navegador
  useEffect(() => {
    // Si ya existe, no hacemos nada
    if (document.getElementById('fintoc-script')) return;

    const script = document.createElement("script");
    script.id = 'fintoc-script'; // Le ponemos ID para no duplicarlo
    script.src = "https://js.fintoc.com/v1/";
    script.async = true;
    
    document.body.appendChild(script);

    // Limpieza al desmontar
    return () => {
      // Opcional: No borramos el script para que quede en caché si el usuario vuelve
    };
  }, []);

  const openFintoc = () => {
    if (!(window as any).Fintoc) {
      alert("El widget aún está cargando. Intenta en un segundo.");
      return;
    }

    setIsLoading(true);

    const widget = (window as any).Fintoc.create({
      publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY!,
      holderType: 'individual',
      product: 'movements',
      country: 'cl',
      onSuccess: function(response: any) {
        console.log("✅ Token:", response.exchange_token);
        router.push('/'); 
      },
      onExit: function() {
        console.log("Widget cerrado");
        setIsLoading(false);
      }
    });

    widget.open();
  }

  return (
    <button 
      onClick={openFintoc}
      disabled={isLoading}
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