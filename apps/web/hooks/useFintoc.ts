import { useState, useEffect } from 'react';

// Esto evita que TypeScript reclame por window.Fintoc
declare global {
  interface Window {
    Fintoc: any;
  }
}

// Fíjate aquí: "export const" (Exportación Nombrada)
export const useFintoc = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.fintoc.com/v1/';
    script.async = true;
    script.onload = () => {
      console.log('✅ Script de Fintoc cargado');
      setIsReady(true);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Esta es la función clave: openWidget
  const openWidget = async () => {
    if (!isReady) {
      alert('Espera un segundo, Fintoc aún está cargando...');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🎫 Pidiendo pase (Intent) al servidor...');
      const response = await fetch('/api/fintoc/intent', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error('Error al contactar al servidor (Intent)');
      }

      const data = await response.json();
      console.log('🎟️ Pase recibido:', data);

      if (!data.widget_token) {
        throw new Error('El servidor no devolvió un widget_token');
      }

      const widget = window.Fintoc.create({
        publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY,
        widgetToken: data.widget_token,
        onSuccess: async (linkIntent: any) => {
          console.log('🎉 Éxito! Intent completado:', linkIntent);
          
          // En el flujo Intent, el token viene aquí
          const exchangeToken = linkIntent.exchangeToken; 

          console.log("buscando tokem.....",{
            loQueLlega: linkIntent,
            exchangeTokenLeido: exchangeToken
          });

          if (!exchangeToken) {
             alert('Error: Fintoc no entregó el token de intercambio');
             return;
          }

          // Enviamos a sincronizar
          try {
             await fetch('/api/fintoc/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exchange_token: exchangeToken })
             });
             
             alert('¡Conexión Exitosa! Recarga la página para ver tus gastos.');
             window.location.reload();

          } catch (err) {
             console.error(err);
             alert('Cuenta vinculada, pero hubo un error guardando los datos.');
          }
        },
        onExit: () => {
          console.log('Usuario cerró el widget');
          setIsLoading(false);
        },
      });

      widget.open();

    } catch (error: any) {
      console.error('❌ Error en openWidget:', error);
      alert(`Error iniciando conexión: ${error.message}`);
      setIsLoading(false);
    }
  };

  return { openWidget, isLoading, isReady };
};