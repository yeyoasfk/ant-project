'use client'

import React from 'react'
import { formatAmount } from '@/lib/utils'
import { TrendingUp, TrendingDown, Layers } from 'lucide-react'

interface CashFlowSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  freeCash: number;
}

const CashFlowSummary = ({ totalIncome, totalExpenses, freeCash }: CashFlowSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full mb-2">
      
      {/* 🟢 TARJETA 1: INGRESOS */}
      <div className="flex flex-col gap-4 sm:gap-6 rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl bg-[#1f1019]/60 backdrop-blur-xl transition-all hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group cursor-default">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="size-5" />
          </div>
          <h2 className="text-14 sm:text-16 font-medium text-gray-400">
            Ingresos del Mes
          </h2>
        </div>
        <div className="flex-1">
          <p className="text-24 sm:text-28 lg:text-32 font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">
            {formatAmount(totalIncome)}
          </p>
        </div>
      </div>

      {/* 🔴 TARJETA 2: EGRESOS */}
      <div className="flex flex-col gap-4 sm:gap-6 rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl bg-[#1f1019]/60 backdrop-blur-xl transition-all hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] group cursor-default">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform duration-300">
            <TrendingDown className="size-5" />
          </div>
          <h2 className="text-14 sm:text-16 font-medium text-gray-400">
            Egresos del Mes
          </h2>
        </div>
        <div className="flex-1">
          <p className="text-24 sm:text-28 lg:text-32 font-bold text-white group-hover:text-rose-400 transition-colors duration-300">
            {formatAmount(totalExpenses)}
          </p>
        </div>
      </div>

      {/* 🟣 TARJETA 3: SALDO LIBRE (FLUJO DE CAJA) */}
      <div className="flex flex-col gap-4 sm:gap-6 rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl bg-[#1f1019]/60 backdrop-blur-xl transition-all hover:border-[#572371]/60 hover:shadow-glow-purple group cursor-default">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-white/5 text-[#9d6dc0] group-hover:scale-110 transition-transform duration-300">
            <Layers className="size-5" />
          </div>
          <h2 className="text-14 sm:text-16 font-medium text-gray-400">
            Flujo de Caja
          </h2>
        </div>
        <div className="flex-1">
          <p className={`text-24 sm:text-28 lg:text-32 font-bold transition-colors duration-300 ${freeCash >= 0 ? 'text-white group-hover:text-[#9d6dc0]' : 'text-rose-500'}`}>
            {formatAmount(freeCash)}
          </p>
        </div>
      </div>

    </div>
  )
}

export default CashFlowSummary