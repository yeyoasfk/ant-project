import { useState, useEffect } from 'react';

export default function useFintoc() { // <--- Fíjate que dice export default
  const [isLoading, setIsLoading] = useState(false);

  const initFintoc = () => {
    setIsLoading(true);
    // Aquí simulamos la carga del script si no está listo
    const script = document.createElement('script');
    script.src = "https://js.fintoc.com/v1/";
    script.onload = () => {
        // La lógica real de Fintoc iría aquí, pero para la demo
        // redirigimos a la conexión o abrimos el widget.
        console.log("Fintoc Script Cargado");
        // Si tienes la lógica del widget, va aquí.
        // Por ahora, para evitar errores, simulamos que termina de cargar:
        setTimeout(() => setIsLoading(false), 2000); 
    };
    document.body.appendChild(script);
  };

  // ¡ESTA ES LA PARTE IMPORTANTE QUE TE FALTA!
  return { 
    initFintoc, 
    isLoading 
  };
}