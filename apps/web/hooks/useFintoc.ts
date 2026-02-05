import { useState, useEffect } from 'react';

// Le decimos a TypeScript que "Fintoc" existe en la ventana global
declare global {
  interface Window {
    Fintoc: any;
  }
}

export default function useFintoc() {
  const [isLoading, setIsLoading] = useState(false);

  const initFintoc = () => {
    setIsLoading(true);

    // 1. Revisamos si el script ya existe para no cargarlo doble
    if (document.getElementById('fintoc-script')) {
      openWidget();
      return;
    }

    // 2. Si no existe, lo creamos
    const script = document.createElement('script');
    script.src = "https://js.fintoc.com/v1/";
    script.id = 'fintoc-script';
    
    script.onload = () => {
      console.log("✅ Script de Fintoc cargado correctamente");
      openWidget();
    };

    script.onerror = () => {
      console.error("❌ Error cargando Fintoc");
      setIsLoading(false);
      alert("No se pudo conectar con el banco. Revisa tu conexión.");
    };

    document.body.appendChild(script);
  };

  // Función interna para abrir la ventana
  const openWidget = () => {
    if (!window.Fintoc) {
      console.error("Fintoc no está definido en window");
      setIsLoading(false);
      return;
    }

    try {
      const widget = window.Fintoc.create({
        publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY,
        holderType: 'individual',
        product: 'movements',
        webhookUrl: 'https://hormiga-app.vercel.app/api/webhooks/fintoc', // <--- IMPORTANTE: Tu URL real
        onSuccess: (link: any) => {
          console.log('🎉 Éxito! Link creado:', link);
          setIsLoading(false);
          alert("¡Cuenta vinculada con éxito!");
        },
        onExit: () => {
          console.log('Usuario cerró el widget');
          setIsLoading(false);
        },
      });

      widget.open();
    } catch (error) {
      console.error("Error al crear el widget:", error);
      setIsLoading(false);
    }
  };

  return { 
    initFintoc, 
    isLoading 
  };
}