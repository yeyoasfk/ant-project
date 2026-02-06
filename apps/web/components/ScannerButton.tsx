'use client';

import { useState } from 'react';

export default function AiAdvisorButton() {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAdvice(null);
    try {
      const res = await fetch('/api/ai/analyze', { method: 'POST' });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      setAdvice(data.advice);
    } catch (error) {
      alert('La IA está durmiendo... intenta luego.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
      >
        {loading ? '🐜 Analizando tus gastos...' : '🤖 Ejecutar IA Hormiga'}
      </button>

      {/* Aquí mostramos el consejo si existe */}
      {advice && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl text-purple-900 animate-fade-in">
          <h3 className="font-bold mb-1 flex items-center gap-2">
            <span>💡</span> Consejo de la Hormiga:
          </h3>
          <p className="text-sm leading-relaxed">{advice}</p>
        </div>
      )}
    </div>
  );
}