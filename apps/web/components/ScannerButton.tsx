'use client'; // Esto es vital para que el botón tenga interactividad

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { detectarHormiga } from '../utils/hormigaAlgo';

// Cliente Supabase para el navegador
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ScannerButton() {
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    
    // 1. Traemos todas las transacciones
    const { data: transactions } = await supabase.from('transactions').select('*');

    if (transactions) {
      let count = 0;

      // 2. Revisamos una por una
      for (const t of transactions) {
        const esHormiga = detectarHormiga(t.description);

        // Si el algoritmo dice una cosa y la BD tiene otra, actualizamos
        if (esHormiga !== t.is_hormiga) {
          await supabase
            .from('transactions')
            .update({ is_hormiga: esHormiga })
            .eq('id', t.id);
          count++;
        }
      }
      
      if (count > 0) {
        alert(`🐜 Se detectaron y corrigieron ${count} gastos hormiga nuevos.`);
        window.location.reload(); // Recargamos para ver los cambios
      } else {
        alert("✅ Todo parece estar categorizado correctamente.");
      }
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleScan}
      disabled={loading}
      className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg active:scale-95 transition-all hover:bg-indigo-700 disabled:opacity-50"
    >
      {loading ? '🔍 Analizando...' : '🤖 Ejecutar IA Hormiga'}
    </button>
  );
}