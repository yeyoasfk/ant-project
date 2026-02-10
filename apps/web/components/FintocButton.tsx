"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { linkBankAccount } from '@/lib/actions/bank.actions';

const FintocButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Precargamos el script apenas entra a la página para que esté listo al hacer click
    if (!(window as any).Fintoc) {
      const script = document.createElement("script");
      script.src = "https://js.fintoc.com/v1/";
      script.id = 'fintoc-v1';
      document.body.appendChild(script);
    }
  }, []);

  const openFintoc = () => {
    const Fintoc = (window as any).Fintoc;
    
    if (!Fintoc) {
      alert("El sistema de seguridad bancaria aún no carga. Espera 3 segundos y reintenta.");
      return;
    }

    setIsLoading(true);

    const widget = Fintoc.create({
        publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY!,
        holderType: 'individual',
        product: 'movements',
        country: 'cl',
      // Esto ayuda a que el widget sepa exactamente quién lo llama
        webhookUrl: 'https://tu-app.com/api/webhook', 
    onSuccess: async function(response: any) {
        console.log("✅ Éxito:", response);
        
        try{
            //guardamos en la bd
            await linkBankAccount({
                fintocId: response.id,
                institutionName: response.institution.name,
                institutionId: response.institution.id
            });

            //redirigimos al home donde ahora apareceran los gastos
            window.location.href = '/';
            }catch(err){
                console.error("error guardando en DB", err);
                alert("Cuenta vinculada en Fintoc pero error al guardar en la app.");
            }
        },
      
    onExit: function() {
        setIsLoading(false);
        console.log("Widget cerrado");
      }
    });

    widget.open();
  }

  if (!isMounted) return null;

  return (
    <button 
      onClick={openFintoc}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-lg bg-bankGradient px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50"
    >
      {isLoading ? (
        <><Loader2 className="animate-spin size-5" /> Abriendo Banco...</>
      ) : (
        <><Plus className="size-5" /> Vincular Cuenta Bancaria</>
      )}
    </button>
  )
}

export default FintocButton;