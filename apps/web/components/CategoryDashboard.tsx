"use client"

import { useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatAmount } from '@/lib/utils';
import { ArrowLeft, LayoutGrid } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 🧠 DATOS SIMULADOS (Luego vendrán de Supabase)
const mockCategories = [
  { id: '1', name: 'Comida', limit: 150000, spent: 140000, icon: '🍔' },
  { id: '2', name: 'Suscripciones', limit: 40000, spent: 38000, icon: '🎬' },
  { id: '3', name: 'Transporte', limit: 60000, spent: 55000, icon: '🚌' },
  { id: '4', name: 'Salidas', limit: 100000, spent: 40000, icon: '🍻' },
  { id: '5', name: 'Cuentas', limit: 80000, spent: 20000, icon: '📄' },
  { id: '6', name: 'Ropa', limit: 50000, spent: 10000, icon: '👕' },
  { id: '7', name: 'Mascotas', limit: 30000, spent: 28000, icon: '🐶' },
  { id: '8', name: 'Gimnasio', limit: 25000, spent: 25000, icon: '🏋️' },
];

export default function CategoryDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [timeframe, setTimeframe] = useState<'dia' | 'semana' | 'mes'>('semana');

  // 🧠 LÓGICA DEL GRÁFICO
  const chartData = useMemo(() => {
    // ESTADO 1: Vista General (Top 7 más cercanos al límite)
    if (!selectedCategory) {
      // Ordenamos por porcentaje de uso (de mayor a menor) y tomamos los primeros 7
      const top7 = [...mockCategories]
        .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))
        .slice(0, 7);

      return {
        labels: top7.map(c => c.name),
        datasets: [
          // 1. AHORA PONEMOS 'UTILIZADO' PRIMERO (Para que se dibuje al FRENTE)
          {
            label: 'Utilizado',
            data: top7.map(c => c.spent),
            backgroundColor: '#653584', // Púrpura vibrante
            borderColor: '#9d6dc0',     // Borde brillante
            borderWidth: 2, 
            grouped: false,
            borderRadius: 8,
            barPercentage: 0.6,
          },
          // 2. PONEMOS EL 'LÍMITE' SEGUNDO (Para que se dibuje ATRÁS)
          {
            label: 'Límite (Fondo)',
            data: top7.map(c => c.limit),
            backgroundColor: '#1a0b21', // Fondo oscuro
            grouped: false,
            borderRadius: 8,
            barPercentage: 0.6,
          }
        ]
      };
    }

    // ESTADO 2: Vista de Categoría Específica (Tiempo)
    // Aquí simulamos datos de tiempo. Luego se filtrarán tus transacciones reales.
    let labels: string[] = [];
    let data: number[] = [];

    if (timeframe === 'semana') {
      labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      data = [0, 15000, 0, 5000, 12000, 0, 8000]; // Simulación
    } else if (timeframe === 'mes') {
      labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      data = [20000, 35000, 10000, 15000]; // Simulación
    } else if (timeframe === 'dia') {
      labels = ['Mañana', 'Tarde', 'Noche'];
      data = [5000, 0, 12000]; // Simulación
    }

    return {
      labels,
      datasets: [
        {
          label: `Gastos en ${selectedCategory.name}`,
          data: data,
          backgroundColor: '#9333ea', 
          borderRadius: 6,
          barPercentage: 0.5,
        }
      ]
    };
  }, [selectedCategory, timeframe]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    // 🧠 MAGIA DE INTERACCIÓN: Agrupa los datos al pasar el mouse por la columna
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: { 
      legend: { display: false },
      // 🎨 DISEÑO DEL TOOLTIP (Cuadro flotante)
      tooltip: {
        backgroundColor: 'rgba(31, 16, 25, 0.9)', // Fondo oscuro acrílico
        titleColor: '#e5e7eb', // Título gris claro
        bodyColor: '#ffffff', // Texto blanco
        bodyFont: { weight: 'bold' },
        borderColor: 'rgba(101, 53, 132, 0.5)', // Borde púrpura
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true, // Muestra el cuadrito de color al lado del texto
        callbacks: {
          // Formateamos los números a Pesos Chilenos usando tu función
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatAmount(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: { 
        border: { display: false }, 
        grid: { color: 'rgba(255,255,255,0.05)' }, 
        ticks: { 
          color: '#9ca3af',
          // También formateamos los números del eje Y lateral
          callback: (value: any) => formatAmount(value).replace(',00', '')
        } 
      },
      x: { 
        border: { display: false }, 
        grid: { display: false }, 
        ticks: { color: '#9ca3af', font: { weight: '500' } } 
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      
      {/* 📊 SECCIÓN SUPERIOR: GRÁFICO CON EFECTO NEÓN GLOW */}
      <div className="relative group">
        {/* 1. CAPA EXTERIOR: El Borde Degradado y el Resplandor (Glow) */}
        <div 
          className="absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-fuchsia-600 via-[#9333ea] to-transparent opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500" 
          aria-hidden="true"
        />
        
        {/* 2. CAPA INTERIOR: El Contenido Acrílico Oscuro */}
        <div className="relative flex flex-col gap-6 rounded-3xl bg-[#110916]/80 backdrop-blur-2xl border border-white/10 p-6 md:p-8 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          
          {/* Cabecera del Gráfico */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {selectedCategory ? (
                <>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div>
                    <h2 className="text-18 font-bold text-white flex items-center gap-2">
                      {selectedCategory.icon} Análisis: {selectedCategory.name}
                    </h2>
                    <p className="text-13 text-gray-400">Historial de gastos del presupuesto</p>
                  </div>
                </>
              ) : (
                <div>
                  <h2 className="text-18 font-bold text-white flex items-center gap-2">
                    <LayoutGrid className="size-5 text-[#653584]" /> Top 7: Al límite
                  </h2>
                  <p className="text-13 text-gray-400">Categorías más cercanas a su presupuesto máximo</p>
                </div>
              )}
            </div>

            {/* Pestañas de Tiempo (Solo visibles si hay categoría seleccionada) */}
            {selectedCategory && (
              <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
                {['dia', 'semana', 'mes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTimeframe(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-12 font-semibold capitalize transition-all ${
                      timeframe === tab ? 'bg-[#572371] text-white shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* El Gráfico */}
          <div className="h-[280px] w-full mt-4">
            <Bar data={chartData as any} options={chartOptions as any} />
          </div>
        </div>
      </div>

      {/* 📋 SECCIÓN INFERIOR: LISTA DE CATEGORÍAS */}
      <div className="flex flex-col gap-4">
        <h3 className="text-16 font-semibold text-white px-2">Todas tus Categorías</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockCategories.map((category) => {
            const percentage = Math.min((category.spent / category.limit) * 100, 100);
            const isDanger = percentage >= 90;
            const isSelected = selectedCategory?.id === category.id;

            return (
              <div 
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`group cursor-pointer flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300 ${
                  isSelected 
                    ? 'bg-[#3b174d]/80 border-[#653584] shadow-[0_0_15px_rgba(101,53,132,0.4)]' 
                    : 'bg-[#1f1019]/40 border-white/5 hover:border-[#572371]/50 hover:bg-[#2d183b]/40 backdrop-blur-md'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-black/30 border border-white/5 flex items-center justify-center text-xl">
                      {category.icon}
                    </div>
                    <span className="font-bold text-gray-200">{category.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-15 font-bold text-white">{formatAmount(category.spent)}</span>
                    <span className="text-11 text-gray-500 font-medium">de {formatAmount(category.limit)}</span>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="w-full bg-black/40 rounded-full h-2 mt-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'bg-red-500' : 'bg-gradient-to-r from-[#572371] to-[#9333ea]'}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {isDanger && <p className="text-[10px] text-red-400 font-semibold text-right mt-1">¡Cerca del límite!</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}