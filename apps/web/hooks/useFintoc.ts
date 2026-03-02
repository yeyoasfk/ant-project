import { useState, useEffect } from 'react';
import { linkBankAccount } from '@/lib/actions/bank.actions';

// ─────────────────────────────────────────────────────────────────────────────
// useFintoc — Hook para el widget de Fintoc (flujo Link Intents)
//
// 1. Backend: POST /api/fintoc/intent → widget_token (encapsula product/holderType/country)
// 2. Fintoc.create({ publicKey, widgetToken }) → widget con sesión de backend
// 3. onSuccess: exchangeToken → linkBankAccount (intercambia por link_token)
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Fintoc: any;
  }
}

export const useFintoc = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (window.Fintoc) { setIsReady(true); return; }

    const existingScript = document.getElementById('fintoc-v1');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsReady(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.fintoc.com/v1/';
    script.id = 'fintoc-v1';
    script.async = true;
    script.onload = () => {
      console.log('✅ [useFintoc] Script de Fintoc cargado.');
      setIsReady(true);
    };
    script.onerror = () => console.error('❌ [useFintoc] Error cargando el script.');
    document.body.appendChild(script);
  }, []);

  const openWidget = async () => {
    if (!isReady || !window.Fintoc) {
      alert('Espera un segundo, Fintoc aún está cargando...');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/fintoc/intent', { method: 'POST' });
      if (!response.ok) throw new Error('Error al contactar al servidor (Intent)');

      const data = await response.json();
      const widgetToken = data.widget_token ?? data.widgetToken;
      if (!widgetToken) throw new Error('El servidor no devolvió un widget_token');

      const widget = window.Fintoc.create({
        publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY!,
        widgetToken,

        onSuccess: async (linkIntent: any) => {
          console.log('📋 [useFintoc] onSuccess:', JSON.stringify(linkIntent, null, 2));

          const exchangeToken =
            linkIntent?.exchangeToken ??
            linkIntent?.exchange_token ??
            linkIntent?.exchangetoken;

          if (!exchangeToken) {
            console.error('❌ [useFintoc] exchangeToken ausente:', linkIntent);
            alert('Error: Fintoc no entregó el token de intercambio.');
            setIsLoading(false);
            return;
          }

          const institutionData = linkIntent?.institution || linkIntent?.link?.institution || {};

          try {
            await linkBankAccount({
              exchangeToken,
              institutionName: institutionData.name || 'Banco Desconocido',
              institutionId: institutionData.id || 'id_desconocido',
            });
            window.location.assign('/transaction-history');
          } catch (err: any) {
            alert('Error al vincular: ' + err.message);
            setIsLoading(false);
          }
        },

        onExit: () => {
          console.log('🚪 [useFintoc] Usuario cerró el widget.');
          setIsLoading(false);
        },

        onEvent: (event: any) => {
          const eventType = event?.type ?? event ?? '(desconocido)';
          console.log('📡 [useFintoc] Evento:', eventType);
        },
      });

      widget.open();

    } catch (error: any) {
      console.error('❌ [useFintoc] Error:', error);
      alert(`Error iniciando conexión: ${error.message}`);
      setIsLoading(false);
    }
  };

  return { openWidget, isLoading, isReady };
};