"use client" // 👈 Importante para usar hooks como useState

import { useState } from 'react'
import { formatAmount, formatDateTime, getTransactionStatus, cn } from '../lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react' // Íconos opcionales si los tienes, si no, usaré texto simple

const CategoryBadge = ({ category }: { category: string }) => {
  const styles: { [key: string]: string } = {
    'Comida': 'bg-pink-100 text-pink-700 border-pink-200',
    'Transporte': 'bg-blue-100 text-blue-700 border-blue-200',
    'Ingreso': 'bg-green-100 text-green-700 border-green-200',
    'Suscripciones': 'bg-purple-100 text-purple-700 border-purple-200',
    'default': 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <div className={cn("flex items-center justify-center gap-1 rounded-2xl border-[1.5px] px-3 py-0.5 w-fit", styles[category] || styles.default)}>
      <div className={cn("size-2 rounded-full", category === 'Ingreso' ? 'bg-green-600' : 'bg-current')} />
      <p className="text-[12px] font-medium">{category}</p>
    </div>
  )
}

const TransactionsTable = ({ transactions }: { transactions: any[] }) => {
  // Estado para controlar el ordenamiento
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: string | null }>({
    key: null,
    direction: null
  });

  // 1. Calcular frecuencia de categorías (para el filtro inteligente)
  const getCategoryFrequency = () => {
    const counts: { [key: string]: number } = {};
    transactions.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  };

  // 2. Función maestra de ordenamiento
  const getSortedTransactions = () => {
    if (!sortConfig.key) return transactions; // Si no hay filtro, devolver original

    return [...transactions].sort((a, b) => {
      const statusA = getTransactionStatus(new Date(a.date));
      const statusB = getTransactionStatus(new Date(b.date));
      const freqMap = getCategoryFrequency();

      switch (sortConfig.key) {
        case 'name': // Transacción (Alfabético)
          return sortConfig.direction === 'asc' 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        
        case 'amount': // Monto (Numérico)
          return sortConfig.direction === 'asc' 
            ? a.amount - b.amount 
            : b.amount - a.amount;
        
        case 'date': // Fecha (Cronológico)
          return sortConfig.direction === 'asc' 
            ? new Date(a.date).getTime() - new Date(b.date).getTime() 
            : new Date(b.date).getTime() - new Date(a.date).getTime();

        case 'status': // Estado (Ciclo Personalizado)
          if (sortConfig.direction === 'success') {
             // Exitoso primero
             if (statusA === 'Exitoso' && statusB !== 'Exitoso') return -1;
             if (statusA !== 'Exitoso' && statusB === 'Exitoso') return 1;
             return 0;
          }
          if (sortConfig.direction === 'pending') {
             // Procesando primero
             if (statusA === 'Procesando' && statusB !== 'Procesando') return -1;
             if (statusA !== 'Procesando' && statusB === 'Procesando') return 1;
             return 0;
          }
          return 0;

        case 'category': // Categoría (Por frecuencia)
          const freqA = freqMap[a.category] || 0;
          const freqB = freqMap[b.category] || 0;
          // Orden descendente (Más usada a menos usada)
          return freqB - freqA;

        default:
          return 0;
      }
    });
  };

  // 3. Manejador de Clics en Encabezados
  const handleSort = (key: string) => {
    let direction = 'asc';

    if (key === 'status') {
        // Ciclo especial: Exitoso -> Pendiente -> Normal
        if (sortConfig.key === 'status' && sortConfig.direction === 'success') {
            direction = 'pending';
        } else if (sortConfig.key === 'status' && sortConfig.direction === 'pending') {
            // Resetear
            setSortConfig({ key: null, direction: null });
            return;
        } else {
            direction = 'success';
        }
    } else if (key === 'category') {
        // Solo un estado: Frecuencia (podríamos agregar revertir si quisieras)
        direction = 'frequency';
    } else {
        // Toggle estándar (Asc <-> Desc)
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
    }

    setSortConfig({ key, direction });
  };

  // Helper para mostrar íconos según el estado
  const renderSortIcon = (columnKey: string) => {
      if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />;
      
      if (columnKey === 'status') {
          if (sortConfig.direction === 'success') return <span className="ml-2 text-xs text-green-600 font-bold">(Exitoso)</span>;
          if (sortConfig.direction === 'pending') return <span className="ml-2 text-xs text-gray-600 font-bold">(Pendiente)</span>;
      }
      if (columnKey === 'category') return <Filter className="ml-2 h-4 w-4 text-blue-600" />;
      
      return sortConfig.direction === 'asc' 
        ? <ArrowUp className="ml-2 h-4 w-4 text-blue-600" /> 
        : <ArrowDown className="ml-2 h-4 w-4 text-blue-600" />;
  };

  const sortedData = getSortedTransactions();

  return (
    <table className="w-full border-collapse">
      <thead className="bg-[#f9fafb]">
        <tr>
          {/* Transacción */}
          <th onClick={() => handleSort('name')} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 max-md:hidden cursor-pointer hover:bg-gray-100 transition-colors select-none group">
            <div className="flex items-center">Transacción {renderSortIcon('name')}</div>
          </th>
          
          {/* Monto */}
          <th onClick={() => handleSort('amount')} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none">
            <div className="flex items-center">Monto {renderSortIcon('amount')}</div>
          </th>
          
          {/* Estado */}
          <th onClick={() => handleSort('status')} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 max-md:hidden cursor-pointer hover:bg-gray-100 transition-colors select-none">
            <div className="flex items-center">Estado {renderSortIcon('status')}</div>
          </th>
          
          {/* Fecha */}
          <th onClick={() => handleSort('date')} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 max-md:hidden cursor-pointer hover:bg-gray-100 transition-colors select-none">
            <div className="flex items-center">Fecha {renderSortIcon('date')}</div>
          </th>
          
          {/* Categoría */}
          <th onClick={() => handleSort('category')} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 max-md:hidden cursor-pointer hover:bg-gray-100 transition-colors select-none">
            <div className="flex items-center">Categoría {renderSortIcon('category')}</div>
          </th>
        </tr>
      </thead>
      
      <tbody>
        {sortedData.map((t: any) => {
          const status = getTransactionStatus(new Date(t.date));
          const isDebit = t.type === 'debit';
          const isIncome = t.category === 'Ingreso';

          return (
            <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
              <td className="max-w-[250px] pl-4 py-4 pr-10">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-blue-700 font-bold group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors">
                     {t.name[0]}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h1 className="text-14 truncate font-semibold text-gray-900">{t.name}</h1>
                    <p className="text-xs text-gray-500 md:hidden">{t.category}</p>
                  </div>
                </div>
              </td>
              <td className={cn("pl-4 py-4 pr-10 font-semibold text-14", isDebit || !isIncome ? 'text-red-600' : 'text-green-600')}>
                {isDebit ? '-' : '+'}{formatAmount(t.amount)}
              </td>
              <td className="pl-4 py-4 pr-10 max-md:hidden">
                <div className={cn("flex items-center gap-2 px-2 py-1 rounded-full w-fit text-xs font-medium border", 
                    status === 'Exitoso' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                )}>
                    <div className={cn("size-2 rounded-full", status === 'Exitoso' ? 'bg-green-600' : 'bg-gray-600')} />
                    {status}
                </div>
              </td>
              <td className="pl-4 py-4 pr-10 text-14 text-gray-600 max-md:hidden min-w-[120px]">
                {formatDateTime(t.date)}
              </td>
              <td className="pl-4 py-4 pr-10 max-md:hidden">
                <CategoryBadge category={t.category} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default TransactionsTable