"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { linkBankAccount } from '@/lib/actions/bank.actions';

// ─────────────────────────────────────────────────────────────────────────────
// Fintoc Widget — Flujo Link Intents (correcto para movements)
//
// 1. Backend: POST /api/fintoc/intent → crea un Link Intent en Fintoc
//    → Fintoc devuelve un widget_token que codifica product/holderType/country
// 2. Frontend: Fintoc.create({ publicKey, widgetToken, onSuccess, ... })
//    → El widget usa el widget_token como contexto de sesión
// 3. onSuccess: recibe linkIntent.exchangeToken (token temporal, un solo uso)
// 4. Backend linkBankAccount: exchangeToken → link_token permanente → guarda en DB
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Fintoc: any;
  }
}

export default function FintocButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  // Cargar el script de Fintoc una sola vez
  useEffect(() => {
    setIsMounted(true);

    if (window.Fintoc) { setScriptReady(true); return; }

    const existingScript = document.getElementById('fintoc-v1');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptReady(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.fintoc.com/v1/';
    script.id = 'fintoc-v1';
    script.async = true;
    script.onload = () => {
      console.log('✅ [Fintoc] Script cargado correctamente.');
      setScriptReady(true);
    };
    script.onerror = () => console.error('❌ [Fintoc] Error cargando el script.');
    document.body.appendChild(script);
  }, []);

  const openFintoc = async () => {
    if (!window.Fintoc) {
      alert('El widget aún no está listo. Espera un momento.');
      return;
    }

    setIsLoading(true);

    try {
      // PASO 1: Crear Link Intent en el backend → obtener widget_token
      // El Link Intent codifica product + holderType + country en un token seguro.
      console.log('🎫 [Fintoc] Creando Link Intent en el servidor...');
      const intentRes = await fetch('/api/fintoc/intent', { method: 'POST' });

      if (!intentRes.ok) {
        const err = await intentRes.json().catch(() => ({ error: intentRes.statusText }));
        throw new Error(err.error || `Error ${intentRes.status} al crear el Link Intent`);
      }

      const intentData = await intentRes.json();
      const widgetToken = intentData.widget_token ?? intentData.widgetToken;

      if (!widgetToken) {
        throw new Error('El servidor no devolvió un widget_token válido. Revisa los logs del servidor.');
      }

      console.log('✅ [Fintoc] widget_token recibido:', widgetToken.substring(0, 30) + '...');

      // PASO 2: Abrir el widget con el widget_token del Link Intent.
      // El widget_token ya contiene product/holderType/country — no se necesitan
      // esos parámetros aquí (el intent los encapsula en el token).
      const widget = window.Fintoc.create({
        publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY!,
        widgetToken,

        // onSuccess se llama una vez que el usuario autenticó correctamente.
        // El payload contiene el exchangeToken (token temporal, un solo uso).
        onSuccess: async (linkIntent: any) => {
          console.log('📋 [Fintoc] onSuccess payload:', JSON.stringify(linkIntent, null, 2));

          const exchangeToken =
            linkIntent?.exchangeToken ??
            linkIntent?.exchange_token ??
            linkIntent?.exchangetoken;

          if (!exchangeToken) {
            console.error('❌ [Fintoc] exchangeToken ausente. Payload completo:', linkIntent);
            alert(
              'Tu banco ya tenía una sesión activa con esta app.\n\n' +
              'Para desvincular y reconectar:\n' +
              '1. Ingresa a tu banca en línea.\n' +
              '2. Revoca el acceso a "Hormiga" en las apps conectadas.\n' +
              '3. Vuelve aquí y haz clic en "Vincular Cuenta Bancaria" de nuevo.'
            );
            setIsLoading(false);
            return;
          }

          console.log('🔑 [Fintoc] exchangeToken:', exchangeToken.substring(0, 30) + '...');

          const institutionData = linkIntent?.institution || linkIntent?.link?.institution || {};

          try {
            // El backend intercambia exchangeToken → link_token permanente
            // y descarga los movimientos iniciales
            await linkBankAccount({
              exchangeToken,
              institutionName: institutionData.name || 'Banco Desconocido',
              institutionId: institutionData.id || 'id_desconocido',
            });
            window.location.assign('/transaction-history');
          } catch (err: any) {
            console.error('❌ [Fintoc] Error al vincular cuenta:', err);
            alert('Error al vincular: ' + err.message);
            setIsLoading(false);
          }
        },

        // onExit: el usuario cerró el widget manualmente
        onExit: () => {
          console.log('🚪 [Fintoc] Usuario cerró el widget.');
          setIsLoading(false);
        },

        // onEvent: log de cada acción del usuario dentro del widget
        onEvent: (event: any) => {
          const eventType = event?.type ?? event ?? '(desconocido)';
          console.log('📡 [Fintoc] Evento:', eventType, typeof event === 'object' ? event : '');
        },
      });

      widget.open();

    } catch (err: any) {
      console.error('❌ [Fintoc]', err);
      alert(err.message);
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <button
      onClick={openFintoc}
      disabled={isLoading || !scriptReady}
      title={!scriptReady ? 'Cargando seguridad bancaria...' : undefined}
      className="flex items-center gap-2 rounded-lg bg-bankGradient px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-wait"
    >
      {isLoading
        ? <><Loader2 className="animate-spin size-5" /> Procesando...</>
        : !scriptReady
          ? <><Loader2 className="animate-spin size-5" /> Cargando...</>
          : <><Plus className="size-5" /> Vincular Cuenta Bancaria</>}
    </button>
  );
}