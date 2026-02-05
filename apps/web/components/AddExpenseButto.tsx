'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { detectarHormiga } from '../utils/hormigaAlgo';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddExpenseButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Datos del formulario
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Aplicamos la Inteligencia Artificial Local 🧠
    const esHormiga = detectarHormiga(description);

    // 2. Guardamos en Supabase
    const { error } = await supabase.from('transactions').insert({
      description: description.toUpperCase(), // Guardamos en mayúsculas para mantener orden
      amount: Number(amount),
      date: new Date().toISOString(),
      is_hormiga: esHormiga,
      category: esHormiga ? 'Gasto Hormiga' : 'Manual',
      // No mandamos fintoc_id porque es manual
    });

    if (error) {
      alert('Error al guardar: ' + error.message);
    } else {
      // 3. Limpieza y Éxito
      setDescription('');
      setAmount('');
      setIsOpen(false);
      window.location.reload(); // Recargamos para ver el nuevo gasto
    }
    setLoading(false);
  };

  return (
    <>
      {/* --- BOTÓN FLOTANTE (FAB) --- */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center text-3xl hover:bg-indigo-700 transition-all active:scale-90 z-50"
      >
        +
      </button>

      {/* --- MODAL (FORMULARIO) --- */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <h2 className="text-xl font-bold text-gray-800 mb-4">Nuevo Gasto 💸</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">¿Qué compraste?</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Completos, Bebida, Pan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Monto ($)</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 3000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}