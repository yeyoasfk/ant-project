'use client';

// IMPORTANTE: Importamos con llaves { } porque en el otro archivo usamos "export const"
import { useFintoc } from "../hooks/useFintoc"; 

export default function ConnectBankButton() {
  const { openWidget, isLoading, isReady } = useFintoc(); 

  return (
    <button
      onClick={openWidget}
      disabled={isLoading || !isReady}
      className="text-11 sm:text-12 md:text-13 font-bold text-indigo-600 bg-indigo-50 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {isLoading ? 'Conectando...' : '🏦 Vincular Banco'}
    </button>
  );
}