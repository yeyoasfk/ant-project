'use client';

// Fíjate: SIN LLAVES {}
import useFintoc from "../hooks/useFintoc";

export default function ConnectBankButton() {
  const { initFintoc, isLoading } = useFintoc();

  return (
    <button
      onClick={initFintoc}
      disabled={isLoading}
      className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
    >
      {isLoading ? 'Conectando...' : '🏦 Vincular Banco'}
    </button>
  );
}