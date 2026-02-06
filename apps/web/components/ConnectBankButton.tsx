'use client';

// IMPORTANTE: Importamos con llaves { } porque en el otro archivo usamos "export const"
import { useFintoc } from "../hooks/useFintoc"; 

export default function ConnectBankButton() {
  // Usamos el mismo nombre que definimos arriba: openWidget
  const { openWidget, isLoading, isReady } = useFintoc(); 

  return (
    <button
      onClick={openWidget}
      disabled={isLoading || !isReady} // Deshabilitado si carga o no está listo
      className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Conectando...' : '🏦 Vincular Banco'}
    </button>
  );
}