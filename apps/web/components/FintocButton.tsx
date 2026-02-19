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

  const openFintoc = async () => {
    const Fintoc = (window as any).Fintoc;
    
    if (!Fintoc) {
      alert("El sistema de seguridad bancaria aún no carga. Espera 3 segundos y reintenta.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. PRIMERO: Crear Link Intent en el backend para obtener widget_token
      // Sin esto, el widget NO devuelve exchangeToken en onSuccess
      console.log("📡 [Fintoc] Creando Link Intent...");
      const intentRes = await fetch('/api/fintoc/intent', { method: 'POST' });
      
      if (!intentRes.ok) {
        const errData = await intentRes.json().catch(() => ({}));
        throw new Error(errData.error || `Error al crear Link Intent: ${intentRes.status}`);
      }

      const intentData = await intentRes.json();
      const widgetToken = intentData.widget_token ?? intentData.widgetToken;
      
      if (!widgetToken) {
        console.error("❌ [Fintoc] Respuesta del intent:", intentData);
        throw new Error("No se recibió widget_token del backend");
      }

      console.log("✅ [Fintoc] Widget token obtenido:", widgetToken.substring(0, 20) + "...");

      // 2. Abrir widget CON el widget_token (flujo Link Intent)
      const widget = Fintoc.create({
        publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY!,
        widgetToken: widgetToken, // ← CRÍTICO: Sin esto no hay exchangeToken
        holderType: 'individual',
        product: 'movements',
        country: 'cl',
        
        onSuccess: async function(linkIntent: any) {
          console.log("✅ [Fintoc] Payload completo recibido:", linkIntent);
          
          const exchangeToken = linkIntent.exchangeToken ?? linkIntent.exchange_token;
          
          if (!exchangeToken) {
            console.error("❌ [Fintoc] No exchangeToken en linkIntent:", linkIntent);
            alert("Error: No se recibió el token de intercambio. Intenta nuevamente.");
            setIsLoading(false);
            return;
          }

          // 🧠 EXTRACCIÓN INTELIGENTE: Buscamos la institución en la raíz o dentro de 'link'
          const institutionData = linkIntent.institution || linkIntent.link?.institution || {};
          const nombreReal = institutionData.name || 'Banco Desconocido';
          const idReal = institutionData.id || 'id_desconocido';

          console.log("🏦 [Fintoc] Banco detectado:", nombreReal, idReal);
          console.log("📤 [Fintoc] Enviando datos al backend...");

          try {
            await linkBankAccount({
              fintocId: exchangeToken, 
              institutionName: nombreReal, // 👈 Ahora viajará "Banco Santander"
              institutionId: idReal        // 👈 Ahora viajará "cl_banco_santander"
            });

            window.location.assign('/transaction-history');
          } catch(err: any) {
            console.error("❌ [Fintoc] Error guardando:", err);
            alert(err?.message || "Error al vincular la cuenta. Intenta nuevamente.");
            setIsLoading(false);
          }
        },
      
        onExit: function() {
          setIsLoading(false);
          console.log("Widget cerrado");
        }
      });

      widget.open();
    } catch (err: any) {
      console.error("❌ [Fintoc] Error:", err);
      alert(err?.message || "Error al conectar con Fintoc. Intenta nuevamente.");
      setIsLoading(false);
    }
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