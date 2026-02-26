"use client"

import { useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatAmount, getCategoryIcon } from '@/lib/utils';
import { ArrowLeft, LayoutGrid, Plus, X, Loader2, Edit2, Trash2 } from 'lucide-react'; 
import GlassContainer from './GlassContainer';
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/category.actions';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function CategoryDashboard({ initialCategories = [] }: { initialCategories?: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [timeframe, setTimeframe] = useState<'dia' | 'semana' | 'mes'>('semana');

  // ESTADOS DEL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setNewName('');
    setNewLimit('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedCategory) return;
    setEditingCategory(selectedCategory);
    setNewName(selectedCategory.name);
    setNewLimit(selectedCategory.limit.toString());
    setIsModalOpen(true);
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLimit) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, newName, Number(newLimit));
        setSelectedCategory({ ...selectedCategory, name: newName, limit: Number(newLimit) });
      } else {
        await createCategory({ name: newName, budget_limit: Number(newLimit) });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar la categoría", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    const isConfirmed = window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${selectedCategory.name}"?`);
    if (!isConfirmed) return;

    try {
      await deleteCategory(selectedCategory.id);
      setSelectedCategory(null); 
    } catch (error) {
      console.error("Error al eliminar", error);
    }
  };

  const categoriesData = useMemo(() => {
    return initialCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      limit: Number(cat.budget_limit) || 1, 
      spent: cat.spent || 0, 
      icon: getCategoryIcon(cat.name),
      color: cat.color || '#9333ea',
    }));
  }, [initialCategories]);

  const chartData = useMemo(() => {
    if (!selectedCategory) {
      const top7 = [...categoriesData]
        .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))
        .slice(0, 7);

      return {
        labels: top7.map(c => c.name),
        datasets: [
          {
            label: 'Utilizado',
            data: top7.map(c => c.spent),
            backgroundColor: '#653584',
            borderColor: '#9d6dc0',
            borderWidth: 2, 
            grouped: false,
            borderRadius: 8,
            barPercentage: 0.6,
          },
          {
            label: 'Límite (Fondo)',
            data: top7.map(c => c.limit),
            backgroundColor: '#1a0b21',
            grouped: false,
            borderRadius: 8,
            barPercentage: 0.6,
          }
        ]
      };
    }

    let labels: string[] = [];
    let data: number[] = [];

    if (timeframe === 'semana') {
      labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      data = [0, 0, 0, 0, 0, 0, 0];
    } else if (timeframe === 'mes') {
      labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      data = [0, 0, 0, 0];
    } else if (timeframe === 'dia') {
      labels = ['Mañana', 'Tarde', 'Noche'];
      data = [0, 0, 0];
    }

    return {
      labels,
      datasets: [
        {
          label: `Gastos en ${selectedCategory.name}`,
          data: data,
          backgroundColor: selectedCategory.color || '#9333ea', 
          borderRadius: 6,
          barPercentage: 0.5,
        }
      ]
    };
  }, [selectedCategory, timeframe, categoriesData]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(31, 16, 25, 0.9)',
        titleColor: '#e5e7eb',
        bodyColor: '#ffffff',
        bodyFont: { weight: 'bold' },
        borderColor: 'rgba(101, 53, 132, 0.5)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) label += formatAmount(context.parsed.y);
            return label;
          }
        }
      }
    },
    scales: {
      y: { border: { display: false }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', callback: (value: any) => formatAmount(value).replace(',00', '') } },
      x: { border: { display: false }, grid: { display: false }, ticks: { color: '#9ca3af', font: { weight: '500' } } }
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-6xl mx-auto px-4 md:px-0">
      
      <GlassContainer variant={selectedCategory ? "default" : "default"}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-start md:items-center gap-2 md:gap-3">
            {selectedCategory ? (
              <>
                <button onClick={() => setSelectedCategory(null)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors flex-shrink-0">
                  <ArrowLeft className="size-4 md:size-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-14 md:text-18 font-bold text-white flex items-center gap-2">
                      {selectedCategory.icon} Análisis: {selectedCategory.name}
                    </h2>
                    
                    {/* 👈 BOTONES SIEMPRE VISIBLES PARA TODAS LAS CATEGORÍAS */}
                    <div className="flex items-center gap-1 bg-black/20 rounded-lg p-0.5 border border-white/5">
                      <button onClick={handleOpenEdit} className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Editar Categoría">
                        <Edit2 className="size-3.5" />
                      </button>
                      <button onClick={handleDelete} className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors" title="Eliminar Categoría">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-12 md:text-13 text-gray-400">Historial de gastos del presupuesto</p>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-14 md:text-18 font-bold text-white flex items-center gap-2">
                  <LayoutGrid className="size-4 md:size-5 text-[#653584]" /> Top 7: Al límite
                </h2>
                <p className="text-12 md:text-13 text-gray-400">Categorías más cercanas a su presupuesto máximo</p>
              </div>
            )}
          </div>

          {selectedCategory && (
            <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
              {['dia', 'semana', 'mes'].map((tab) => (
                <button key={tab} onClick={() => setTimeframe(tab as any)} className={`px-3 md:px-4 py-1.5 rounded-full text-11 md:text-12 font-semibold capitalize transition-all ${timeframe === tab ? 'bg-[#572371] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-[240px] md:h-[280px] w-full mt-2 md:mt-4">
          {categoriesData.length > 0 ? (
            <Bar data={chartData as any} options={chartOptions as any} />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-500 italic">
              Aún no hay categorías creadas.
            </div>
          )}
        </div>
      </GlassContainer>

      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex justify-between items-center px-2 md:px-0">
          <h3 className="text-14 md:text-16 font-semibold text-white">Todas tus Categorías</h3>
          <button onClick={handleOpenCreate} className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gradient-to-r from-[#653584] to-[#9333ea] hover:from-[#7a429e] hover:to-[#a855f7] text-white text-12 md:text-14 font-semibold transition-all shadow-[0_0_15px_rgba(101,53,132,0.5)] hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]">
            <Plus className="size-4" />
            <span className="hidden sm:block">Nueva Categoría</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {categoriesData.map((category) => {
            const percentage = Math.min((category.spent / category.limit) * 100, 100);
            const isDanger = percentage >= 90;
            const isSelected = selectedCategory?.id === category.id;

            return (
              <GlassContainer 
                key={category.id}
                variant={isSelected ? 'default' : 'info'}
                size="sm"
                className={`cursor-pointer transition-transform hover:scale-[1.02] ${isSelected ? 'border-[#653584]' : 'border-transparent'}`}
              >
                <div onClick={() => setSelectedCategory(category)} className="w-full">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="size-9 md:size-10 rounded-full bg-black/30 border border-white/5 flex items-center justify-center text-lg md:text-xl flex-shrink-0">
                        {category.icon}
                      </div>
                      <span className="font-bold text-sm md:text-base text-gray-200">{category.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-13 md:text-15 font-bold text-white">{formatAmount(category.spent)}</span>
                      <span className="text-10 md:text-11 text-gray-500 font-medium">de {formatAmount(category.limit)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-2 mt-1 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'bg-red-500' : 'bg-gradient-to-r from-[#572371] to-[#9333ea]'}`} style={{ width: `${percentage}%` }} />
                  </div>
                  {isDanger && <p className="text-[10px] md:text-xs text-red-400 font-semibold text-right mt-1">¡Cerca del límite!</p>}
                </div>
              </GlassContainer>
            )
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="animate-in fade-in zoom-in duration-200 w-full max-w-md">
            <GlassContainer variant="default" size="lg">
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-18 md:text-20 font-bold text-white">
                  {editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitCategory} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-13 font-semibold text-gray-300">Nombre de la Categoría</label>
                  <input
                    id="name" type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej. Gimnasio, Mascotas..."
                    className="w-full bg-[#1a0b21] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="limit" className="text-13 font-semibold text-gray-300">Presupuesto Máximo Mensual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input
                      id="limit" type="number" required min="1" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} placeholder="50000"
                      className="w-full bg-[#1a0b21] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#653584] to-[#9333ea] hover:from-[#7a429e] hover:to-[#a855f7] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <><Loader2 className="size-5 animate-spin" /> Guardando...</> : editingCategory ? 'Actualizar Presupuesto' : 'Guardar Presupuesto'}
                </button>
              </form>

            </GlassContainer>
          </div>
        </div>
      )}

    </div>
  )
}