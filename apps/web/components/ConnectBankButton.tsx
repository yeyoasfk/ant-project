'use client';

// 1. CORRECCIÓN: Agregamos llaves { } porque es una exportación nombrada
import { useFintoc } from "../hooks/useFintoc";

export default function ConnectBankButton() {
  // 2. CORRECCIÓN: Cambiamos 'initFintoc' por 'openWidget' (así se llama en el hook nuevo)
  const { openWidget, isLoading } = useFintoc();

  return (
    <button
      onClick={openWidget} // <--- Aquí llamamos a la función con el nombre correcto
      disabled={isLoading}
      className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Conectando...' : '🏦 Vincular Banco'}
    </button>
  );
}