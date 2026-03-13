"use client"

import { useState } from 'react'
import { formatAmount, formatDateTime, getTransactionStatus, cn, getCategoryIcon } from '../lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import GlassContainer from './GlassContainer'
import { useTransactionModal } from './TransactionModalContext'

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
  // Obtener el callback del contexto
  const { onSelectTransaction } = useTransactionModal()

  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: string | null }>({ key: null, direction: null });
  
  // 🧠 ESTADOS DE EXPANSIÓN DE LA TABLA
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_LIMIT = 5; // 👈 Cantidad de movimientos a mostrar al inicio

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
                onClick={() => onSelectTransaction(t)}
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
                    onClick={() => onSelectTransaction(t)} 
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
    </>
  )
}

export default TransactionsTable