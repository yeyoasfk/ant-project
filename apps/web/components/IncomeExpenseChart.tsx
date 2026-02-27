"use client"

import { useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatAmount } from '@/lib/utils';
import GlassContainer from './GlassContainer';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function IncomeExpenseChart({ transactions = [] }: { transactions: any[] }) {
  // 1. ESTADOS
  const [timeframe, setTimeframe] = useState<'semana' | 'mes' | 'año'>('mes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados temporales del modal
  const [tempSearchDate, setTempSearchDate] = useState('');
  const [tempFilterType, setTempFilterType] = useState<'ambos' | 'ingresos' | 'egresos'>('ambos');
  
  // Filtro aplicado realmente
  const [appliedFilter, setAppliedFilter] = useState<{ date: string, type: 'ambos' | 'ingresos' | 'egresos' } | null>(null);

  // 2. LÓGICA DE FILTRADO (Basado en el modal)
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (appliedFilter) {
      // Filtrar por fecha exacta (si seleccionó una)
      if (appliedFilter.date) {
        filtered = filtered.filter(t => t.date && t.date.startsWith(appliedFilter.date));
      }
      // Filtrar por tipo (Ingreso / Egreso)
      if (appliedFilter.type === 'ingresos') {
        filtered = filtered.filter(t => t.type === 'credit' || t.amount > 0);
      } else if (appliedFilter.type === 'egresos') {
        filtered = filtered.filter(t => t.type === 'debit' || t.amount < 0);
      }
    }
    return filtered;
  }, [transactions, appliedFilter]);

  // 3. CÁLCULO DE TOTALES (Para el cuadro inferior que estaba descuadrado)
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'credit' || t.amount > 0) income += Math.abs(t.amount);
      if (t.type === 'debit' || t.amount < 0) expense += Math.abs(t.amount);
    });
    return { totalIncome: income, totalExpense: expense };
  }, [filteredTransactions]);

  // 4. DATOS DEL GRÁFICO (Chart.js)
  const chartData = useMemo(() => {
    let labels: string[] = [];
    let incomeData: number[] = [];
    let expenseData: number[] = [];

    // Por defecto, agrupamos por semana si es 'mes' (para coincidir con tu diseño)
    if (timeframe === 'semana') {
      labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      incomeData = [0,0,0,0,0,0,0];
      expenseData = [0,0,0,0,0,0,0];
      
      filteredTransactions.forEach(t => {
        if(!t.date) return;
        const d = new Date(t.date);
        let day = d.getDay() - 1; 
        if (day === -1) day = 6;
        
        if (t.type === 'credit' || t.amount > 0) {
          incomeData[day] = (incomeData[day] || 0) + Math.abs(Number(t.amount));
        } else {
          expenseData[day] = (expenseData[day] || 0) + Math.abs(Number(t.amount));
        }
      });

    } else if (timeframe === 'mes') {
      labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4+'];
      incomeData = [0,0,0,0];
      expenseData = [0,0,0,0];
      
      filteredTransactions.forEach(t => {
        if(!t.date) return;
        const d = new Date(t.date);
        let week = Math.floor((d.getDate() - 1) / 7);
        if (week > 3) week = 3;
        
        if (t.type === 'credit' || t.amount > 0) {
          incomeData[week] = (incomeData[week] || 0) + Math.abs(Number(t.amount));
        } else {
          expenseData[week] = (expenseData[week] || 0) + Math.abs(Number(t.amount));
        }
      });

    } else {
      labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      incomeData = new Array(12).fill(0);
      expenseData = new Array(12).fill(0);
      
      filteredTransactions.forEach(t => {
        if(!t.date) return;
        const month = new Date(t.date).getMonth();
        
        if (t.type === 'credit' || t.amount > 0) {
          incomeData[month] = (incomeData[month] || 0) + Math.abs(Number(t.amount));
        } else {
          expenseData[month] = (expenseData[month] || 0) + Math.abs(Number(t.amount));
        }
      });
    }

    return {
      labels,
      datasets: [
        { label: 'Ingresos', data: incomeData, backgroundColor: '#22c55e', borderRadius: 6, barPercentage: 0.6, hidden: appliedFilter?.type === 'egresos' },
        { label: 'Egresos', data: expenseData, backgroundColor: '#653584', borderRadius: 6, barPercentage: 0.6, hidden: appliedFilter?.type === 'ingresos' }
      ]
    };
  }, [filteredTransactions, timeframe, appliedFilter]);

  // Funciones del Modal
  const handleApplyFilter = () => {
    setAppliedFilter({ date: tempSearchDate, type: tempFilterType });
    setIsModalOpen(false);
  };

  const handleClearFilter = () => {
    setTempSearchDate('');
    setTempFilterType('ambos');
    setAppliedFilter(null);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* PESTAÑAS DE TIEMPO (Se quitó "Día") */}
      <div className="flex bg-[#2d183b]/60 p-1.5 rounded-full border border-white/5 w-fit shadow-lg mb-2">
        {['semana', 'mes', 'año'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setTimeframe(tab as any)} 
            className={`px-6 py-2 rounded-full text-13 font-semibold capitalize transition-all ${timeframe === tab ? 'bg-[#572371] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CUADRO PRINCIPAL DEL GRÁFICO */}
      <GlassContainer className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-white">Ingresos & Egresos</h3>
          
          <div className="flex items-center gap-3">
            {/* LUPA -> ABRE EL MODAL */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors relative"
              title="Buscar por fecha y tipo"
            >
              <Search className="size-5" />
              {appliedFilter && <span className="absolute top-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-[#1a0b21]"></span>}
            </button>
            
          </div>
        </div>

        <div className="h-[300px] w-full">
          <Bar 
            data={chartData as any} 
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { border: { display: false }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } } }} 
          />
        </div>
      </GlassContainer>

      {/* CUADRO INFERIOR RE-DISEÑADO (Ya no está descuadrado) */}
      <GlassContainer className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          
          {/* Columna Ingresos */}
          <div className="flex flex-col items-center sm:items-center w-full sm:w-1/2 px-4 gap-2">
            <div className="flex items-center gap-3 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
              <TrendingUp className="size-5 text-green-400" />
              <span className="text-gray-300 font-semibold uppercase tracking-wide text-sm">Ingresos Totales</span>
            </div>
            <span className="text-3xl sm:text-4xl font-bold text-white mt-2">{formatAmount(totalIncome)}</span>
          </div>

          {/* Columna Egresos */}
          <div className="flex flex-col items-center sm:items-center w-full sm:w-1/2 px-4 gap-2 pt-6 sm:pt-0">
            <div className="flex items-center gap-3 bg-[#653584]/20 px-4 py-2 rounded-full border border-[#9d6dc0]/30">
              <TrendingDown className="size-5 text-[#9d6dc0]" />
              <span className="text-gray-300 font-semibold uppercase tracking-wide text-sm">Egresos Totales</span>
            </div>
            <span className="text-3xl sm:text-4xl font-bold text-[#9d6dc0] mt-2">{formatAmount(totalExpense)}</span>
          </div>
          
        </div>
      </GlassContainer>

      {/* 🧠 MODAL DE BÚSQUEDA Y FILTROS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="animate-in fade-in zoom-in duration-200 w-full max-w-sm">
            <GlassContainer size="lg" className="border border-[#9d6dc0]/30 shadow-2xl shadow-[#572371]/20">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Search className="size-5 text-[#9d6dc0]" /> Filtros de Análisis
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Filtro por Fecha */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buscar Fecha Específica</label>
                  <input 
                    type="date" 
                    value={tempSearchDate}
                    onChange={(e) => setTempSearchDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#9d6dc0] transition-colors [color-scheme:dark]"
                  />
                  <p className="text-[10px] text-gray-500 italic">Déjalo en blanco para ver todo el período.</p>
                </div>

                {/* Filtro por Tipo */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo de Movimiento</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setTempFilterType('ambos')}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${tempFilterType === 'ambos' ? 'bg-[#572371] border-[#9d6dc0] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                      Ambos
                    </button>
                    <button 
                      onClick={() => setTempFilterType('ingresos')}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${tempFilterType === 'ingresos' ? 'bg-green-600/50 border-green-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                      Ingresos
                    </button>
                    <button 
                      onClick={() => setTempFilterType('egresos')}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${tempFilterType === 'egresos' ? 'bg-[#653584]/80 border-[#9d6dc0] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                      Egresos
                    </button>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button 
                    onClick={handleClearFilter}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Limpiar Filtro
                  </button>
                  <button 
                    onClick={handleApplyFilter}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#572371] to-[#9d6dc0] hover:opacity-90 transition-all shadow-lg"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

            </GlassContainer>
          </div>
        </div>
      )}

    </div>
  )
}