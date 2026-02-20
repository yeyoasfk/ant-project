"use client"

import { useRouter } from 'next/navigation';
import { formatAmount } from '@/lib/utils';

export default function BankDropdown({ accounts, currentAccountId }: { accounts: any[], currentAccountId: string }) {
  const router = useRouter();

  // Encontramos la cuenta actual seleccionada
  const currentAccount = accounts.find(a => a.fintocAccountId === currentAccountId) || accounts[0];

  // Traductor amigable de tipos de cuenta
  const translateType = (type: string) => {
    const types: Record<string, string> = {
      'checking_account': 'Cuenta Corriente',
      'sight_account': 'Cuenta Vista / Débito',
      'credit_card': 'Tarjeta de Crédito',
      'savings_account': 'Cuenta de Ahorro'
    };
    return types[type] || type.replace('_', ' ');
  };

  const last4 = currentAccount?.number?.slice(-4) || '****';

  return (
    <div className="bg-gradient-to-r from-[#3b174d] via-[#572371] to-[#653584] text-white rounded-2xl p-4 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-creditCard gap-4 md:gap-6 relative border border-white/10">

      <div className="flex flex-col gap-2 md:gap-3 w-full md:w-auto">

        {/* SELECTOR INTEGRADO */}
        <div className="relative inline-block w-full md:w-max max-w-full">
          <select
            value={currentAccountId}
            onChange={(e) => router.push(`/transaction-history?id=${e.target.value}`)}
            className="w-full appearance-none bg-black/20 hover:bg-black/30 border border-white/20 text-white text-base md:text-2xl font-bold rounded-xl px-3 py-2 pr-10 cursor-pointer outline-none transition-colors backdrop-blur-sm truncate"
          >
            {accounts.map(acc => (
              <option key={acc.fintocAccountId} value={acc.fintocAccountId} className="text-gray-900 text-base font-medium">
                {acc.institutionName} - {acc.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* DETALLES DE LA CUENTA */}
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wider uppercase">
            {translateType(currentAccount.type)}
          </span>
          <span className="text-white/70 text-sm font-medium tracking-widest">
            **** {last4}
          </span>
        </div>
      </div>

      {/* SALDO ACTUAL */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between bg-black/20 px-4 py-3 rounded-xl border border-white/10 w-full md:w-auto shrink-0 gap-4 md:gap-1">
        <p className="text-sm text-white/60 font-medium">Saldo Actual</p>
        <p className="text-2xl md:text-3xl font-bold tracking-tight">
          {formatAmount(currentAccount.currentBalance)}
        </p>
      </div>
    </div>
  );
}