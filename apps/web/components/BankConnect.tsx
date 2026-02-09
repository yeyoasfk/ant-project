"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const BankConnect = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // 1. Variable de control

  // 2. Este efecto asegura que el componente solo "exista" en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const openFintoc = () => {
    setIsLoading(true);

    // Verificamos si Fintoc ya existe en la ventana
    if ((window as any).Fintoc) {
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
    } else {
      // Si no existe, cargamos el script manualmente AHORA (Lazy Load real)
      const script = document.createElement("script");
      script.src = "https://js.fintoc.com/v1/";
      script.async = true;
      
      script.onload = () => {
        // Una vez cargado, nos llamamos a nosotros mismos recursivamente para abrir el widget
        openFintoc(); 
      };

      script.onerror = () => {
        console.error("Error cargando Fintoc");
        setIsLoading(false);
      };
      
      document.body.appendChild(script);
    }
  }

  // 3. Si no estamos en el cliente, no renderizamos NADA (Evita error #418)
  if (!isMounted) return null;

  return (
    <button 
      onClick={openFintoc}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-lg bg-bankGradient px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin size-5" />
          Cargando Fintoc...
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