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
      // ========================================
      // PASO 1: CREAR LINK INTENT EN BACKEND
      // ========================================
      console.log("🔄 [PASO 1] Creando Link Intent en el backend...");
      const timestamp1 = Date.now();
      
      const intentRes = await fetch('/api/fintoc/intent', { method: 'POST' });
      
      const timestamp2 = Date.now();
      console.log(`⏱️  [PASO 1] Backend respondió en ${timestamp2 - timestamp1}ms`);
      
      if (!intentRes.ok) {
        const errData = await intentRes.json().catch(() => ({}));
        throw new Error(errData.error || `Error al crear Link Intent: ${intentRes.status}`);
      }

      const intentData = await intentRes.json();
      console.log("✅ [PASO 1] Backend respondió. Datos recibidos:", intentData);

      // ========================================
      // PASO 2: EXTRAER widget_token
      // ========================================
      console.log("🔄 [PASO 2] Extrayendo widget_token de la respuesta...");
      
      const widgetToken = intentData.widget_token || intentData.widgetToken || intentData.widgettoken;
      
      console.log("📋 [PASO 2] Detalles del widget_token:");
      console.log(`   - Valor: ${widgetToken}`);
      console.log(`   - Tipo: ${typeof widgetToken}`);
      console.log(`   - Largo: ${widgetToken?.length}`);
      console.log(`   - Comienza con "li_": ${widgetToken?.startsWith('li_')}`);
      console.log(`   - Comienza con "link_": ${widgetToken?.startsWith('link_')}`);
      
      if (!widgetToken) {
        console.error("❌ [PASO 2] widget_token está vacío!");
        console.error("📋 [PASO 2] Propiedades disponibles en intentData:", Object.keys(intentData));
        console.error("📋 [PASO 2] Respuesta completa:", JSON.stringify(intentData, null, 2));
        throw new Error("No se recibió widget_token del backend");
      }

      console.log(`✅ [PASO 2] widget_token validado: ${widgetToken.substring(0, 30)}...`);

      // ========================================
      // PASO 3: CREAR WIDGET CON EL TOKEN
      // ========================================
      console.log("🔄 [PASO 3] Creando widget con Fintoc.create()...");
      const timestamp3 = Date.now();

      const widget = Fintoc.create({
        publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY!,
        widgetToken: widgetToken,  // ← CRÍTICO: Usar el token NUEVO que acabamos de recibir
        holderType: 'individual',
        product: 'movements',
        country: 'cl',
        
        onSuccess: async function(linkIntent: any) {
          console.log("✅ [PASO 4] onSuccess ejecutado!");
          console.log("📋 [PASO 4] Objeto completo de linkIntent:");
          console.log("   - Keys disponibles:", Object.keys(linkIntent));
          console.log("   - JSON:", JSON.stringify(linkIntent, null, 2));

          // Buscar exchangeToken en todas sus formas
          const exchangeToken = linkIntent.exchangeToken || linkIntent.exchange_token || linkIntent.exchangetoken;
          console.log("🔑 [PASO 4] Buscando exchangeToken:");
          console.log(`   - exchangeToken: ${linkIntent.exchangeToken}`);
          console.log(`   - exchange_token: ${linkIntent.exchange_token}`);
          console.log(`   - exchangetoken: ${linkIntent.exchangetoken}`);
          console.log(`   - Valor encontrado: ${exchangeToken}`);
          
          if (!exchangeToken) {
            const errorMsg = `❌ [PASO 4] No se recibió exchangeToken. Propiedades de linkIntent: ${Object.keys(linkIntent).join(', ')}`;
            console.error(errorMsg);
            console.error("📋 [PASO 4] Todas las propiedades de linkIntent:");
            for (const [key, value] of Object.entries(linkIntent)) {
              console.error(`   - ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
            }
            alert(errorMsg);
            setIsLoading(false);
            return;
          }

          console.log(`✅ [PASO 4] exchangeToken validado: ${exchangeToken.substring(0, 30)}...`);

          // Extraer institución
          const institutionData = linkIntent.institution || linkIntent.link?.institution || {};
          const nombreReal = institutionData.name || 'Banco Desconocido';
          const idReal = institutionData.id || 'id_desconocido';

          console.log(`🏦 [PASO 4] Institución detectada: ${nombreReal} (${idReal})`);

          try {
            console.log("📤 [PASO 4] Enviando datos al backend...");
            await linkBankAccount({
              fintocId: exchangeToken,
              institutionName: nombreReal, 
              institutionId: idReal        
            });

            console.log("✅ [PASO 4] Datos guardados. Redirigiendo...");
            window.location.assign('/transaction-history');
          } catch(err: any) {
            console.error("❌ [PASO 4] Error al guardar:", err);
            alert(err?.message || "Error al vincular la cuenta. Intenta nuevamente.");
            setIsLoading(false);
          }
        },
      
        onExit: function() {
          setIsLoading(false);
          console.log("⭐ [PASO 5] Widget cerrado por el usuario");
        }
      });

      const timestamp4 = Date.now();
      console.log(`✅ [PASO 3] Widget creado en ${timestamp4 - timestamp3}ms`);

      // ========================================
      // PASO 4: ABRIR WIDGET
      // ========================================
      console.log("🔄 [PASO 5] Abriendo widget...");
      const timestamp5 = Date.now();
      
      widget.open();
      
      const timestamp6 = Date.now();
      console.log(`✅ [PASO 5] widget.open() ejecutado en ${timestamp6 - timestamp5}ms`);
      console.log("==================================================");
      console.log("📊 [FLUJO] RESUMEN DE TIMING:");
      console.log(`   - Fetch al backend: ${timestamp2 - timestamp1}ms`);
      console.log(`   - Crear widget: ${timestamp4 - timestamp3}ms`);
      console.log(`   - Abrir widget: ${timestamp6 - timestamp5}ms`);
      console.log(`   - TOTAL: ${timestamp6 - timestamp1}ms`);
      console.log("==================================================");
    } catch (err: any) {
      console.error("❌ [ERROR] Error crítico en openFintoc:", err);
      console.error("📋 [ERROR] Stack trace:", err.stack);
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