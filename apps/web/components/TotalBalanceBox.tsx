'use client'

import { formatAmount } from '../lib/utils';
import CountUp from 'react-countup';
import DoughnutChart from './DoughnutChart';
import { useEffect } from 'react';
import Link from 'next/link';

const TotalBalanceBox = ({
  accounts = [],
  totalBanks,
  totalCurrentBalance
}: { accounts: any[], totalBanks: number, totalCurrentBalance: number }) => {

  // 🔍 LOGS PARA DEBUGGING
  useEffect(() => {
    console.log("📊 [TotalBalanceBox] Props recibidas:", {
      accountsCount: accounts?.length || 0,
      totalBanks: typeof totalBanks === 'number' ? totalBanks : Number(totalBanks) || 0,
      totalCurrentBalance: typeof totalCurrentBalance === 'number' ? totalCurrentBalance : Number(totalCurrentBalance) || 0,
      accounts: accounts?.map((acc: any) => ({
        id: acc.id,
        balance: acc.currentBalance,
        institution: acc.officialName || acc.institution_name
      }))
    });
  }, [accounts, totalBanks, totalCurrentBalance]);

  // 🛡️ VALIDACIÓN Y SANITIZACIÓN
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const safeTotalBanks = typeof totalBanks === 'number' && !isNaN(totalBanks) ? totalBanks : (safeAccounts.length || 0);
  const safeTotalBalance = typeof totalCurrentBalance === 'number' && !isNaN(totalCurrentBalance)
    ? totalCurrentBalance
    : safeAccounts.reduce((sum: number, acc: any) => {
      const balance = typeof acc.currentBalance === 'number' && !isNaN(acc.currentBalance)
        ? acc.currentBalance
        : Number(acc.currentBalance) || 0;
      return sum + balance;
    }, 0);

  // 🛡️ CASO: Sin cuentas
  if (safeAccounts.length === 0) {
    return (
      <section className="flex flex-col sm:flex-row w-full items-center gap-4 sm:gap-6 rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl bg-[#1f1019]/60 backdrop-blur-xl">
        <div className="flex size-full max-w-16 sm:max-w-24 md:max-w-28 items-center">
          <div className="flex items-center justify-center w-full h-full rounded-full bg-white/5">
            <span className="text-gray-400 text-xl sm:text-2xl md:text-3xl">💰</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:gap-6 w-full text-center sm:text-left">
          <h2 className="text-16 sm:text-18 md:text-20 font-semibold text-gray-300">
            0 Cuentas Bancarias
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-12 sm:text-14 font-medium text-gray-500">
              Saldo Total Actual
            </p>
            <div className="text-18 sm:text-24 md:text-28 lg:text-32 flex-1 font-bold text-gray-500 flex items-center justify-center sm:justify-start gap-2">
              {formatAmount(0)}
            </div>
          </div>
          <p className="text-11 sm:text-12 text-gray-500 italic">
            Vincula tu banco para comenzar
          </p>
        </div>
      </section>
    );
  }

  return (
    <Link
      href="/gastos-hormiga"
      className="flex flex-col sm:flex-row w-full items-center gap-4 sm:gap-6 rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl bg-[#1f1019]/60 backdrop-blur-xl transition-all hover:border-[#572371]/60 hover:shadow-glow-purple cursor-pointer group"
    >
      <div className="flex size-full max-w-16 sm:max-w-24 md:max-w-28 items-center transition-transform group-hover:scale-105">
        <DoughnutChart accounts={safeAccounts} />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 w-full">
        <h2 className="text-16 sm:text-18 md:text-20 font-semibold text-gray-200 text-center sm:text-left">
          {safeTotalBanks} {safeTotalBanks === 1 ? 'Cuenta Conectada' : 'Cuentas Conectadas'}
        </h2>
        <div className="flex flex-col gap-2">
          <p className="text-12 sm:text-14 font-medium text-gray-400 text-center sm:text-left">
            Saldo Total Actual
          </p>

          <div className="text-18 sm:text-24 md:text-28 lg:text-32 flex-1 font-bold text-white flex items-center justify-center sm:justify-start gap-2 group-hover:text-[#9d6dc0] transition-colors">
            <CountUp
              end={safeTotalBalance}
              decimal=","
              prefix="$"
              duration={2}
              formattingFn={(value) => formatAmount(value)}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
export default TotalBalanceBox;