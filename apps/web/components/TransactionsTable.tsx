"use client"

import { useState } from 'react'
import { formatAmount, formatDateTime, getTransactionStatus, cn, getCategoryIcon } from '../lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, Save, X } from 'lucide-react'
import GlassContainer from './GlassContainer'
import { categorizeTransaction } from '@/lib/actions/transaction.actions'

// 1. 🛡️ DEFINIMOS LOS TIPOS ESTRICTOS PARA QUE TYPESCRIPT NO SE QUEJE
interface Transaction {
  id: string;
  db_id?: string;
  name: string;
  amount: number;
  date: string;
  type: 'debit' | 'credit';
  categoryId?: string | null;
  categoryName: string;
  categoryColor?: string;
  isAnt?: boolean;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  categories: any[];
}

// 2. 🎨 BADGE DE CATEGORÍA DINÁMICO
const CategoryBadge = ({ name, color, isAnt }: { name: string, color?: string, isAnt?: boolean }) => {
  const bgColor = color ? `${color}20` : 'rgba(255,255,255,0.05)';
  const borderColor = color ? `${color}50` : 'rgba(255,255,255,0.1)';
  const dotColor = color || '#9ca3af';
  const textColor = color || '#d1d5db';

  return (
    <div className="flex items-center gap-1">
      <div 
        className="flex items-center justify-center gap-1.5 rounded-2xl border-[1px] px-3 py-0.5 w-fit shadow-sm"
        style={{ backgroundColor: bgColor, borderColor: borderColor, color: textColor }}
      >
        <div className="size-2 rounded-full" style={{ backgroundColor: dotColor }} />
        <p className="text-[12px] font-medium">{name}</p>
      </div>
      {/* 🐜 EL SELLO DE LA HORMIGA */}
      {isAnt && (
        <span className="text-xs bg-[#572371]/50 border border-[#9d6dc0]/50 px-2 py-0.5 rounded-full" title="Gasto Hormiga">
          🐜
        </span>
      )}
    </div>
  )
}

const TransactionsTable = ({ transactions, categories }: TransactionsTableProps) => {
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: string | null }>({ key: null, direction: null });
  
  // 🧠 ESTADOS DE EXPANSIÓN DE LA TABLA
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_LIMIT = 5; // 👈 Cantidad de movimientos a mostrar al inicio
  
  // 🧠 ESTADOS DEL MODAL INTELIGENTE
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editIsAnt, setEditIsAnt] = useState<boolean>(false);
  const [createRule, setCreateRule] = useState<boolean>(false);
  const [ruleKeyword, setRuleKeyword] = useState<string>('');
  const [applyToPast, setApplyToPast] = useState<boolean>(false);

  const openModal = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditCategoryId(tx.categoryId || '');
    setEditIsAnt(tx.isAnt || false);
    setCreateRule(false);
    setApplyToPast(false);
    setIsCategoryDropdownOpen(false);
    
    // 🛡️ Sugerencia automática de palabra clave (a prueba de fallos)
    const safeName = tx.name || '';
    const firstWord = safeName.split(' ')[0] || '';
    
    setRuleKeyword(firstWord.length > 3 ? firstWord : safeName.substring(0, 8));
  };

  const handleSaveCategory = async () => {
    if (!selectedTx || !selectedTx.db_id) return;
    setIsSaving(true);

    await categorizeTransaction({
      transactionDbId: selectedTx.db_id,
      categoryId: editCategoryId || null,
      isAntExpense: editIsAnt,
      ruleKeyword: createRule ? ruleKeyword : undefined,
      applyToPast: createRule ? applyToPast : false
    });

    setIsSaving(false);
    setSelectedTx(null);
  };

  const getSortedTransactions = () => {
    if (!sortConfig.key) return transactions;
    return [...transactions].sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime() 
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-gray-500" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-[#9d6dc0]" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-[#9d6dc0]" />;
  };

  const sortedData = getSortedTransactions();
  // ✂️ Recortamos los datos dependiendo del estado "isExpanded"
  const displayedData = isExpanded ? sortedData : sortedData.slice(0, INITIAL_LIMIT);
  const hasMore = sortedData.length > INITIAL_LIMIT;

  return (
    <>
      <GlassContainer size="lg" className="p-0 md:p-0 overflow-hidden relative">

        {/* 📱 VISTA MÓVIL (Celulares) */}
        <div className="flex flex-col divide-y divide-white/5 md:hidden">
          {displayedData.map((t: Transaction) => {
            const status = getTransactionStatus(new Date(t.date));
            const isDebit = t.type === 'debit';

            return (
              <div 
                key={t.id} 
                onClick={() => openModal(t)}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3b174d]/80 border border-[#572371]/40 text-[#9d6dc0] font-bold text-sm">
                  {t.name[0]}
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100 truncate">{t.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">{formatDateTime(t.date)}</span>
                    <CategoryBadge name={t.categoryName} color={t.categoryColor} isAnt={t.isAnt} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={cn("text-sm font-bold whitespace-nowrap", isDebit ? 'text-red-400' : 'text-green-400')}>
                    {isDebit ? '-' : '+'}{formatAmount(t.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 💻 VISTA DESKTOP (Computadores) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse min-w-full">
            <thead className="bg-[#2d183b]/60 backdrop-blur-sm sticky top-0 z-10">
              <tr>
                <th onClick={() => handleSort('name')} className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none whitespace-nowrap">
                  <div className="flex items-center">Transacción {renderSortIcon('name')}</div>
                </th>
                <th onClick={() => handleSort('amount')} className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none whitespace-nowrap">
                  <div className="flex items-center">Monto {renderSortIcon('amount')}</div>
                </th>
                <th onClick={() => handleSort('date')} className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none whitespace-nowrap">
                  <div className="flex items-center">Fecha {renderSortIcon('date')}</div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400 whitespace-nowrap">
                  <div className="flex items-center">Categoría</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((t: Transaction) => {
                const isDebit = t.type === 'debit';
                return (
                  <tr 
                    key={t.id} 
                    onClick={() => openModal(t)} 
                    className="border-b border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                  >
                    <td className="max-w-xs pl-4 py-4 pr-10">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3b174d]/80 text-[#9d6dc0] font-bold text-sm">
                          {t.name[0]}
                        </div>
                        <h1 className="text-14 font-semibold text-gray-100 truncate">{t.name}</h1>
                      </div>
                    </td>
                    <td className={cn("pl-4 py-4 pr-10 font-semibold text-14 whitespace-nowrap", isDebit ? 'text-red-400' : 'text-green-400')}>
                      {isDebit ? '-' : '+'}{formatAmount(t.amount)}
                    </td>
                    <td className="pl-4 py-4 pr-10 text-14 text-gray-400 min-w-max">
                      {formatDateTime(t.date)}
                    </td>
                    <td className="pl-4 py-4 pr-10">
                      <CategoryBadge name={t.categoryName} color={t.categoryColor} isAnt={t.isAnt} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 🔽 BOTÓN MOSTRAR MÁS / MENOS */}
        {hasMore && (
          <div className="flex justify-center p-4 border-t border-white/5 bg-gradient-to-t from-[#1a0b21]/80 to-transparent">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-sm font-semibold shadow-sm hover:shadow-glow-purple"
            >
              {isExpanded 
                ? 'Mostrar menos 🔼' 
                : `Mostrar más (${sortedData.length - INITIAL_LIMIT}) 🔽`
              }
            </button>
          </div>
        )}

      </GlassContainer>

      {/* 🧠 MODAL CATEGORIZACIÓN - CENTRADO SIN FONDO MORADO */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#1f1019] border border-white/10 rounded-2xl p-5 sm:p-6 md:p-8 w-full max-w-lg shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6 md:mb-8">
              <div className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-[#572371]/40 border border-[#9d6dc0]/50 flex-shrink-0">
                <span className="text-lg sm:text-xl">📂</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-18 sm:text-20 font-bold text-white">Categorizar Gasto</h2>
                <p className="text-12 sm:text-13 text-gray-400 truncate">{selectedTx.name}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedTx(null);
                  setIsCategoryDropdownOpen(false);
                }}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* CONTENIDO */}
            <div className="space-y-5">
              {/* 1. SELECTOR DE CATEGORÍA - DROPDOWN STYLE BANCO */}
              <div>
                <label className="text-12 sm:text-13 font-semibold text-gray-300 mb-2 sm:mb-3 block uppercase tracking-wider">
                  Categoría
                </label>
                
                {categories.length > 0 ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className="w-full flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#9d6dc0]/60 text-white rounded-xl px-4 py-2.5 text-left transition-all duration-200"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center size-6 rounded-lg bg-[#572371]/60 border border-white/20 text-base">
                        <span>
                          {editCategoryId 
                            ? getCategoryIcon(categories.find((c: any) => c.id === editCategoryId)?.name || '') 
                            : '✕'}
                        </span>
                      </div>
                      <span className="flex-1 text-13 sm:text-14 font-medium truncate">
                        {editCategoryId 
                          ? categories.find((c: any) => c.id === editCategoryId)?.name || 'Sin Categoría'
                          : 'Sin Categorizar'}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`size-4 text-white/60 flex-shrink-0 transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    {/* Panel desplegable */}
                    {isCategoryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#1f1019]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        {/* Sin Categoría */}
                        <button
                          onClick={() => {
                            setEditCategoryId('');
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-13 sm:text-14
                            ${editCategoryId === '' ? 'bg-[#572371]/50 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                          <div className={`flex-shrink-0 size-6 rounded-lg border flex items-center justify-center
                            ${editCategoryId === '' ? 'bg-[#572371]/80 border-[#9d6dc0]/60' : 'bg-white/5 border-white/15'}`}>
                            <span className="text-xs">✕</span>
                          </div>
                          <span className="font-medium">Sin Categorizar</span>
                          {editCategoryId === '' && <div className="ml-auto flex-shrink-0 size-2 rounded-full bg-[#c084fc]" />}
                        </button>

                        {/* Categorías */}
                        {categories.map((c: any) => {
                          const isActive = editCategoryId === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                setEditCategoryId(c.id);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-13 sm:text-14 border-t border-white/5
                                ${isActive ? 'bg-[#572371]/50 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            >
                              <div className={`flex-shrink-0 size-6 rounded-lg border flex items-center justify-center text-base
                                ${isActive ? 'bg-[#572371]/80 border-[#9d6dc0]/60' : 'bg-white/5 border-white/15'}`}>
                                {getCategoryIcon(c.name)}
                              </div>
                              <span className="font-medium truncate">{c.name}</span>
                              {isActive && <div className="ml-auto flex-shrink-0 size-2 rounded-full bg-[#c084fc]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-xl text-center text-sm text-gray-400">
                    No hay categorías disponibles
                  </div>
                )}
              </div>

              {/* 2. INTERRUPTOR GASTO HORMIGA */}
              <div className="p-4 sm:p-5 bg-[#572371]/20 border border-[#572371]/40 rounded-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-13 sm:text-14 font-bold text-white flex items-center gap-2 mb-0.5">
                      <span className="text-base">🐜</span>
                      ¿Es Gasto Hormiga?
                    </h3>
                    <p className="text-11 sm:text-12 text-gray-400">Incluir en monitoreo de fugas</p>
                  </div>
                  <button 
                    onClick={() => setEditIsAnt(!editIsAnt)}
                    className={cn(
                      "flex-shrink-0 w-14 sm:w-16 h-7 sm:h-8 rounded-full transition-all duration-300 relative border-2",
                      editIsAnt 
                        ? 'bg-gradient-to-r from-[#572371] to-[#9d6dc0] border-[#9d6dc0]' 
                        : 'bg-gray-700/50 border-gray-600'
                    )}
                  >
                    <div className={cn(
                      "size-5 sm:size-6 bg-white rounded-full absolute top-0.5 transition-all duration-300",
                      editIsAnt ? 'right-1' : 'left-1'
                    )} />
                  </button>
                </div>
              </div>

              {/* 3. MOTOR DE REGLAS AUTOMÁTICAS */}
              <div className="p-4 sm:p-5 border border-dashed border-white/20 rounded-xl bg-white/5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={createRule}
                    onChange={(e) => setCreateRule(e.target.checked)}
                    className="mt-1 size-4 accent-[#9d6dc0] cursor-pointer flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-13 sm:text-14 text-white font-semibold block mb-1">
                      Crear regla automática 🤖
                    </span>
                    <p className="text-11 sm:text-12 text-gray-400">
                      Futuros gastos con esta palabra se clasificarán automáticamente
                    </p>
                  </div>
                </label>
                
                {createRule && (
                  <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <input 
                      type="text" 
                      value={ruleKeyword}
                      onChange={(e) => setRuleKeyword(e.target.value)}
                      className="mt-3 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-13 text-white placeholder-gray-500 focus:border-[#9d6dc0] focus:outline-none focus:ring-1 focus:ring-[#9d6dc0]/30 transition-all"
                      placeholder="Ej: LIDER, EASYBOX, STARBUCKS"
                      maxLength={50}
                    />
                    
                    {/* ⏪ NUEVO CHECKBOX RETROACTIVO */}
                    <label className="flex items-start gap-3 cursor-pointer bg-black/20 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={applyToPast}
                        onChange={(e) => setApplyToPast(e.target.checked)}
                        className="mt-0.5 size-4 accent-[#9d6dc0] cursor-pointer flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-12 sm:text-13 text-white font-medium block">
                          Aplicar también al historial pasado ⏪
                        </span>
                        <p className="text-11 text-gray-400 mt-0.5 leading-snug">
                          Actualizará todos los movimientos anteriores que contengan "{ruleKeyword || 'esta palabra'}".
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex gap-3 pt-2 flex-col-reverse sm:flex-row">
                <button 
                  onClick={() => {
                    setSelectedTx(null);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="px-4 sm:px-6 py-2.5 rounded-lg text-13 sm:text-14 font-semibold text-gray-300 border border-white/20 hover:border-white/40 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveCategory}
                  disabled={isSaving}
                  className="flex-1 px-4 sm:px-6 py-2.5 rounded-lg text-13 sm:text-14 font-bold text-white bg-gradient-to-r from-[#572371] to-[#9d6dc0] hover:opacity-90 active:opacity-80 flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TransactionsTable