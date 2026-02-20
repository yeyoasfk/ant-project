"use client"

import { useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatAmount } from '@/lib/utils';
import { Calendar, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function IncomeExpenseChart({ transactions }: { transactions: any[] }) {
  const [timeframe, setTimeframe] = useState<'dia' | 'semana' | 'mes' | 'año'>('semana');
  const [showCalendar, setShowCalendar] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // 🧠 Lógica para filtrar y agrupar transacciones según la pestaña seleccionada
  const { chartData, totals } = useMemo(() => {
    const now = new Date();
    let filtered = transactions;

    // 1. ESTO ES CLAVE: Declarar explícitamente que son arreglos de números
    let labels: string[] = [];
    let ingresosData: number[] = [];
    let egresosData: number[] = [];

    // Filtros rápidos
    if (timeframe === 'semana') {
      labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      ingresosData = [0, 0, 0, 0, 0, 0, 0];
      egresosData = [0, 0, 0, 0, 0, 0, 0];

      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = transactions.filter(t => new Date(t.date) >= oneWeekAgo);

      filtered.forEach(t => {
        const dayIndex = (new Date(t.date).getDay() + 6) % 7; // Lunes = 0
        const amount = Math.abs(t.amount);

        // 2. LA FORMA SEGURA: En lugar de +=, usamos esta fórmula anti-errores
        if (t.type === 'credit' && t.amount > 0) {
          ingresosData[dayIndex] = (ingresosData[dayIndex] || 0) + amount;
        } else {
          egresosData[dayIndex] = (egresosData[dayIndex] || 0) + amount;
        }
      });
    } else if (timeframe === 'mes') {
      labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      ingresosData = [0, 0, 0, 0];
      egresosData = [0, 0, 0, 0];

      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = transactions.filter(t => new Date(t.date) >= firstDayOfMonth);

      filtered.forEach(t => {
        const date = new Date(t.date);
        const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
        const amount = Math.abs(t.amount);

        if (t.type === 'credit' && t.amount > 0) {
          ingresosData[weekIndex] = (ingresosData[weekIndex] || 0) + amount;
        } else {
          egresosData[weekIndex] = (egresosData[weekIndex] || 0) + amount;
        }
      });
    } else if (timeframe === 'año') {
      labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      ingresosData = new Array(12).fill(0);
      egresosData = new Array(12).fill(0);

      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      filtered = transactions.filter(t => new Date(t.date) >= firstDayOfYear);

      filtered.forEach(t => {
        const monthIndex = new Date(t.date).getMonth();
        const amount = Math.abs(t.amount);

        if (t.type === 'credit' && t.amount > 0) {
          ingresosData[monthIndex] = (ingresosData[monthIndex] || 0) + amount;
        } else {
          egresosData[monthIndex] = (egresosData[monthIndex] || 0) + amount;
        }
      });
    } else if (timeframe === 'dia') {
      labels = ['Hoy'];
      ingresosData = [0];
      egresosData = [0];

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = transactions.filter(t => new Date(t.date) >= today);

      filtered.forEach(t => {
        const amount = Math.abs(t.amount);

        if (t.type === 'credit' && t.amount > 0) {
          ingresosData[0] = (ingresosData[0] || 0) + amount;
        } else {
          egresosData[0] = (egresosData[0] || 0) + amount;
        }
      });
    }

    // Calcular Totales Globales del periodo
    const totalIngreso = ingresosData.reduce((a, b) => a + b, 0);
    const totalEgreso = egresosData.reduce((a, b) => a + b, 0);

    return {
      chartData: {
        labels,
        datasets: [
          {
            label: 'Ingresos',
            data: ingresosData,
            backgroundColor: '#16a34a', // Verde
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8,
          },
          {
            label: 'Egresos',
            data: egresosData,
            backgroundColor: '#653584', // Purple – egresos
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8,
          }
        ]
      },
      totals: { ingreso: totalIngreso, egreso: totalEgreso }
    };
  }, [transactions, timeframe]);
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { border: { display: false }, grid: { color: 'rgba(255,255,255,0.06)', borderDash: [5, 5] }, ticks: { color: '#9ca3af', callback: (value: any) => `$${value / 1000}k` } },
      x: { border: { display: false }, grid: { display: false }, ticks: { color: '#6b7280', font: { weight: '500' } } }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* PESTAÑAS (TABS) */}
      <div className="flex justify-center md:justify-start">
        <div className="flex bg-[#2d183b]/80 backdrop-blur-sm p-1 rounded-full border border-white/10 shadow-sm w-full md:w-auto overflow-x-auto">
          {['dia', 'semana', 'mes', 'año'].map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeframe(tab as any)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-full text-14 font-semibold capitalize transition-all ${timeframe === tab ? 'bg-[#572371] text-white shadow-glow-purple' : 'text-gray-500 hover:text-gray-200'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TARJETA DEL GRÁFICO */}
      <div className="rounded-2xl border border-white/10 bg-[#1f1019]/60 backdrop-blur-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6 relative">
          <h2 className="text-18 font-bold text-white">Ingresos &amp; Egresos</h2>

          <div className="flex gap-2">
            <button className="flex items-center justify-center size-9 rounded-full bg-[#3b174d]/80 border border-[#572371]/40 text-[#9d6dc0] hover:bg-[#572371]/40 transition-colors">
              <Search className="size-4" />
            </button>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center justify-center size-9 rounded-full bg-[#3b174d]/80 border border-[#572371]/40 text-[#9d6dc0] hover:bg-[#572371]/40 transition-colors"
            >
              <Calendar className="size-4" />
            </button>

            {/* MINI CALENDARIO POPOVER */}
            {showCalendar && (
              <div className="absolute right-0 top-12 z-10 w-64 rounded-xl border border-white/10 bg-[#2d183b]/90 backdrop-blur-xl p-4 shadow-2xl">
                <h3 className="text-12 font-bold text-gray-300 mb-2">Rango de Días (Max 7)</h3>
                <div className="flex flex-col gap-2">
                  <input type="date" className="text-sm border border-white/10 bg-white/5 text-gray-200 rounded-md p-1.5" onChange={e => setCustomRange({ ...customRange, start: e.target.value })} />
                  <input type="date" className="text-sm border border-white/10 bg-white/5 text-gray-200 rounded-md p-1.5" onChange={e => setCustomRange({ ...customRange, end: e.target.value })} />
                  <button className="bg-[#572371] text-white rounded-md py-1.5 text-sm font-semibold mt-1 hover:bg-[#653584] transition-colors" onClick={() => setShowCalendar(false)}>Aplicar</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR DEL GRÁFICO */}
        <div className="h-[250px] w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* CUADRO DE RESUMEN (Ingreso vs Egreso) */}
      <div className="flex flex-row items-center justify-between md:justify-around rounded-2xl border border-white/10 bg-[#1f1019]/60 backdrop-blur-xl p-6 shadow-2xl">
        {/* Total Ingreso */}
        <div className="flex flex-col items-center gap-2 w-1/2 border-r border-white/10">
          <div className="flex items-center gap-1.5">
            <div className="bg-green-900/50 border border-green-700/40 p-1.5 rounded-md">
              <ArrowUpRight className="size-5 text-green-400" />
            </div>
            <p className="text-14 font-semibold text-gray-400">Ingreso</p>
          </div>
          <p className="text-24 font-bold text-white">{formatAmount(totals.ingreso)}</p>
        </div>

        {/* Total Egreso */}
        <div className="flex flex-col items-center gap-2 w-1/2">
          <div className="flex items-center gap-1.5">
            <div className="bg-[#3b174d]/80 border border-[#572371]/40 p-1.5 rounded-md">
              <ArrowDownRight className="size-5 text-[#9d6dc0]" />
            </div>
            <p className="text-14 font-semibold text-gray-400">Egreso</p>
          </div>
          <p className="text-24 font-bold text-[#9d6dc0]">{formatAmount(totals.egreso)}</p>
        </div>
      </div>
    </div>
  );
}