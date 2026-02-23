"use client"

import { useState } from 'react'
import { formatAmount, formatDateTime, getTransactionStatus, cn } from '../lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react'
import GlassContainer from './GlassContainer';

const CategoryBadge = ({ category }: { category: string }) => {
  // Dark-theme badge colours
  const styles: { [key: string]: string } = {
    'Comida': 'bg-pink-900/50 text-pink-300 border-pink-700/50',
    'Transporte': 'bg-blue-900/50 text-blue-300 border-blue-700/50',
    'Ingreso': 'bg-green-900/50 text-green-300 border-green-700/50',
    'Suscripciones': 'bg-purple-900/50 text-purple-300 border-purple-700/50',
    'default': 'bg-white/5 text-gray-400 border-white/10',
  }

  return (
    <div className={cn("flex items-center justify-center gap-1 rounded-2xl border-[1.5px] px-3 py-0.5 w-fit", styles[category] || styles.default)}>
      <div className={cn("size-2 rounded-full", category === 'Ingreso' ? 'bg-green-400' : 'bg-current')} />
      <p className="text-[12px] font-medium">{category}</p>
    </div>
  )
}

const TransactionsTable = ({ transactions }: { transactions: any[] }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: string | null }>({
    key: null,
    direction: null
  });

  const getCategoryFrequency = () => {
    const counts: { [key: string]: number } = {};
    transactions.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  };

  const getSortedTransactions = () => {
    if (!sortConfig.key) return transactions;

    return [...transactions].sort((a, b) => {
      const statusA = getTransactionStatus(new Date(a.date));
      const statusB = getTransactionStatus(new Date(b.date));
      const freqMap = getCategoryFrequency();

      switch (sortConfig.key) {
        case 'name':
          return sortConfig.direction === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'amount':
          return sortConfig.direction === 'asc'
            ? a.amount - b.amount
            : b.amount - a.amount;
        case 'date':
          return sortConfig.direction === 'asc'
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'status':
          if (sortConfig.direction === 'success') {
            if (statusA === 'Exitoso' && statusB !== 'Exitoso') return -1;
            if (statusA !== 'Exitoso' && statusB === 'Exitoso') return 1;
            return 0;
          }
          if (sortConfig.direction === 'pending') {
            if (statusA === 'Procesando' && statusB !== 'Procesando') return -1;
            if (statusA !== 'Procesando' && statusB === 'Procesando') return 1;
            return 0;
          }
          return 0;
        case 'category':
          const freqA = freqMap[a.category] || 0;
          const freqB = freqMap[b.category] || 0;
          return freqB - freqA;
        default:
          return 0;
      }
    });
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (key === 'status') {
      if (sortConfig.key === 'status' && sortConfig.direction === 'success') {
        direction = 'pending';
      } else if (sortConfig.key === 'status' && sortConfig.direction === 'pending') {
        setSortConfig({ key: null, direction: null });
        return;
      } else {
        direction = 'success';
      }
    } else if (key === 'category') {
      direction = 'frequency';
    } else {
      if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-gray-500" />;
    if (columnKey === 'status') {
      if (sortConfig.direction === 'success') return <span className="ml-1 text-xs text-green-400 font-bold">(Exitoso)</span>;
      if (sortConfig.direction === 'pending') return <span className="ml-1 text-xs text-gray-400 font-bold">(Pend.)</span>;
    }
    if (columnKey === 'category') return <Filter className="ml-1 h-3.5 w-3.5 text-[#9d6dc0]" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-[#9d6dc0]" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-[#9d6dc0]" />;
  };

  const sortedData = getSortedTransactions();

  return (
    <GlassContainer size="lg" className="p-0 md:p-0">

      {/* ── MOBILE: Card list (< md) ─────────────────────────────────── */}
      <div className="flex flex-col divide-y divide-white/5 md:hidden">
        {sortedData.map((t: any) => {
          const status = getTransactionStatus(new Date(t.date));
          const isDebit = t.type === 'debit';

          return (
            <div key={t.id} className="flex items-center gap-3 px-1 py-3.5 hover:bg-white/5 transition-colors">
              {/* Avatar */}
              <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3b174d]/80 border border-[#572371]/40 text-[#9d6dc0] font-bold text-sm">
                {t.name[0]}
              </div>

              {/* Info center */}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-100 truncate">{t.name}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">{formatDateTime(t.date)}</span>
                  <CategoryBadge category={t.category} />
                </div>
              </div>

              {/* Amount + Status */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={cn("text-sm font-bold whitespace-nowrap", isDebit ? 'text-red-400' : 'text-green-400')}>                  {isDebit ? '-' : '+'}{formatAmount(t.amount)}
                </span>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap",
                  status === 'Exitoso'
                    ? 'bg-green-900/40 text-green-400 border-green-700/40'
                    : 'bg-white/5 text-gray-400 border-white/10'
                )}>
                  <div className={cn("size-1.5 rounded-full", status === 'Exitoso' ? 'bg-green-400' : 'bg-gray-500')} />
                  {status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: Classic table (md+) ─────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse min-w-full">
          <thead className="bg-[#2d183b]/60 backdrop-blur-sm sticky top-0">
            <tr>
              <th onClick={() => handleSort('name')} className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none whitespace-nowrap">
                <div className="flex items-center">Transacción {renderSortIcon('name')}</div>
              </th>
              <th onClick={() => handleSort('amount')} className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none whitespace-nowrap">
                <div className="flex items-center">Monto {renderSortIcon('amount')}</div>
              </th>
              <th onClick={() => handleSort('status')} className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none whitespace-nowrap">
                <div className="flex items-center">Estado {renderSortIcon('status')}</div>
              </th>
              <th onClick={() => handleSort('date')} className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none whitespace-nowrap">
                <div className="flex items-center">Fecha {renderSortIcon('date')}</div>
              </th>
              <th onClick={() => handleSort('category')} className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none whitespace-nowrap">
                <div className="flex items-center">Categoría {renderSortIcon('category')}</div>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedData.map((t: any) => {
              const status = getTransactionStatus(new Date(t.date));
              const isDebit = t.type === 'debit';

              return (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="max-w-xs pl-4 py-4 pr-10">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3b174d]/80 border border-[#572371]/40 text-[#9d6dc0] font-bold group-hover:border-[#572371] transition-colors text-sm">
                        {t.name[0]}
                      </div>
                      <h1 className="text-14 font-semibold text-gray-100 truncate">{t.name}</h1>
                    </div>
                  </td>
                  <td className={cn("pl-4 py-4 pr-10 font-semibold text-14 whitespace-nowrap", isDebit ? 'text-red-400' : 'text-green-400')}>                    {isDebit ? '-' : '+'}{formatAmount(t.amount)}
                  </td>
                  <td className="pl-4 py-4 pr-10">
                    <div className={cn("flex items-center gap-2 px-2 py-1 rounded-full w-fit text-xs font-medium border whitespace-nowrap",
                      status === 'Exitoso'
                        ? 'bg-green-900/40 text-green-400 border-green-700/40'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    )}>
                      <div className={cn("size-2 rounded-full", status === 'Exitoso' ? 'bg-green-400' : 'bg-gray-500')} />
                      {status}
                    </div>
                  </td>
                  <td className="pl-4 py-4 pr-10 text-14 text-gray-400 min-w-max">
                    {formatDateTime(t.date)}
                  </td>
                  <td className="pl-4 py-4 pr-10">
                    <CategoryBadge category={t.category} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassContainer>
  )
}

export default TransactionsTable