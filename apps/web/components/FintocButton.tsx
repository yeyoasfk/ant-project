"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { linkBankAccount } from '@/lib/actions/bank.actions';

const FintocButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
        // ASEGÚRATE QUE ESTA SEA TU LLAVE LIVE REAL (pk_live_...)
        publicKey: 'pk_live_Q6sbmtQzoA8fyY_q-uujBfWFYfcKt_VU8QpGr2dFR1U',
        holderType: 'individual',
        product: 'movements',
        country: 'cl',
        webhookUrl: 'https://tu-app.com/api/webhook', 
        
        onSuccess: async function(response: any) {
            console.log("✅ Respuesta completa de Fintoc:", response);
            
            // 🚨 VALIDACIÓN DE SEGURIDAD 🚨
            // Buscamos el exchange_token. A veces viene directo, a veces dentro de un objeto.
            // Usamos el operador '||' para tener un respaldo si response.id es lo único que hay.
            const tokenToSend = response.exchange_token || response.id;

            console.log("📤 Enviando al Backend:", tokenToSend);

            try {
                await linkBankAccount({
                    // CORRECCIÓN CLAVE: Enviamos el exchange_token
                    fintocId: tokenToSend, 
                    institutionName: response.institution.name,
                    institutionId: response.institution.id
                });

                // Redirigimos
                window.location.assign('/');
            } catch(err) {
                console.error("error guardando en DB", err);
                alert("Cuenta vinculada en Fintoc pero error al guardar en la app.");
                setIsLoading(false); // Importante: dejar de cargar si falla
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
        <><Loader2 className="animate-spin size-5" /> Procesando...</>
      ) : (
        <><Plus className="size-5" /> Vincular Cuenta Bancaria</>
      )}
    </button>
  )
}

export default FintocButton;