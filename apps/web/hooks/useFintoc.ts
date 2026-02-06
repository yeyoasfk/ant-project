import { useState, useEffect } from 'react';

// Declaramos que Fintoc existe en la ventana global
declare global {
  interface Window {
    Fintoc: any;
  }
}

export const useFintoc = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // 1. Cargamos el script de Fintoc al iniciar
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.fintoc.com/v1/';
    script.async = true;
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openWidget = async () => {
    if (!isReady || !window.Fintoc) {
      alert('El widget de Fintoc aún no carga. Espera un segundo.');
      return;
    }

    setIsLoading(true);

    try {
      // A. PEDIMOS EL PASE ÚNICO (Link Intent) AL BACKEND
      console.log('pedir pase al backend...');
      const intentResp = await fetch('/api/fintoc/intent', { method: 'POST' });
      const intentData = await intentResp.json();

      if (intentData.error) throw new Error(intentData.error);
      const widgetToken = intentData.widget_token;

      // B. INICIAMOS EL WIDGET CON EL PASE
      const widget = window.Fintoc.create({
        widgetToken: widgetToken, // <--- LA CLAVE DEL ÉXITO
        onSuccess: async (linkIntent: any) => {
          console.log('🎉 Éxito en Widget! Link Intent recibido:', linkIntent);
          
          // C. AHORA SÍ: El token viene en el Intent
          // Según la IA, viene en linkIntent.exchange_token o similar.
          // En modo Intent, el objeto que llega NO es el Link, es el Intent.
          const exchangeToken = linkIntent.exchange_token; 

          if (!exchangeToken) {
             alert('Error crítico: No llegó el exchange_token');
             setIsLoading(false);
             return;
          }

          // D. ENVIAMOS EL TOKEN A SINCRONIZAR
          try {
             const syncResp = await fetch('/api/fintoc/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exchange_token: exchangeToken })
             });
             const syncData = await syncResp.json();
             
             alert(`¡Conexión Perfecta! Se bajaron ${syncData.movimientos_guardados} movimientos.`);
             window.location.reload();

          } catch (err: any) {
             alert(`Fallo en sync: ${err.message}`);
          } finally {
             setIsLoading(false);
          }
        },
        onExit: () => {
          console.log('Usuario cerró el widget');
          setIsLoading(false);
        },
      });

      widget.open();

    } catch (error: any) {
      console.error('Error iniciando widget:', error);
      alert('Error al iniciar conexión: ' + error.message);
      setIsLoading(false);
    }
  };

  return { openWidget, isLoading, isReady };
};