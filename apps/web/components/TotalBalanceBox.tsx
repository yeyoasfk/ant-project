'use client'

import { formatAmount } from '../lib/utils';
import CountUp from 'react-countup';
import DoughnutChart from './DoughnutChart';
import { useEffect } from 'react';

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
      <section className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 shadow-chart sm:gap-6 sm:p-6 bg-white">
        <div className="flex size-full max-w-[100px] items-center sm:max-w-[120px]">
          <div className="flex items-center justify-center w-full h-full rounded-full bg-gray-100">
            <span className="text-gray-400 text-2xl">💰</span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="text-18 font-semibold text-gray-900">
            0 Cuentas Bancarias
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-14 font-medium text-gray-600">
              Saldo Total Actual
            </p>
            <div className="text-24 lg:text-30 flex-1 font-semibold text-gray-400 flex items-center gap-2">
              {formatAmount(0)}
            </div>
          </div>
          <p className="text-12 text-gray-500 italic">
            Vincula tu banco para comenzar
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 shadow-chart sm:gap-6 sm:p-6 bg-white">
      <div className="flex size-full max-w-[100px] items-center sm:max-w-[120px]">
        <DoughnutChart accounts={safeAccounts} />
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-18 font-semibold text-gray-900">
          {safeTotalBanks} {safeTotalBanks === 1 ? 'Cuenta Bancaria' : 'Cuentas Bancarias'}
        </h2>
        <div className="flex flex-col gap-2">
          <p className="text-14 font-medium text-gray-600">
            Saldo Total Actual
          </p>

          <div className="text-24 lg:text-30 flex-1 font-semibold text-gray-900 flex items-center gap-2">
            <CountUp 
              end={safeTotalBalance} 
              decimal=","
              prefix="$"
              duration={2}
              formattingFn={(value) => {
                const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
                return formatAmount(numValue);
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TotalBalanceBox;