"use client"

import { useRouter } from 'next/navigation';
import { formatAmount } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export default function MiniBankDropdown({ accounts, currentAccountId }: { accounts: any[], currentAccountId: string }) {
  const router = useRouter();
  const currentAccount = accounts.find(a => a.fintocAccountId === currentAccountId) || accounts[0];

  if (!currentAccount) return null;

  const last4 = currentAccount.number?.slice(-4) || '****';

  return (
    <div className="bg-gradient-to-r from-[#3b174d] via-[#572371] to-[#653584] text-white rounded-xl p-3 md:px-5 md:py-3 flex flex-col md:flex-row justify-between items-start md:items-center shadow-creditCard border border-white/10 gap-3 w-full">

      <div className="flex flex-col w-full md:w-auto">
        <div className="relative inline-block w-full md:w-max">
          <select
            value={currentAccountId}
            onChange={(e) => router.push(`/gastos-hormiga?id=${e.target.value}`)}
            className="w-full appearance-none bg-transparent hover:bg-white/10 text-white text-16 font-bold rounded-lg py-1 pr-8 cursor-pointer outline-none transition-colors truncate"
          >
            {accounts.map(acc => (
              <option key={acc.fintocAccountId} value={acc.fintocAccountId} className="text-gray-900 font-medium">
                {acc.institutionName}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-white">
            <ChevronDown className="size-4" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
            {currentAccount.type === 'checking_account' ? 'Cta. Corriente' : 'Cta. Vista'}
          </span>
          <span className="text-blue-100 text-12 font-medium">**** {last4}</span>
        </div>
      </div>

      {/* Saldo a la derecha */}
      <div className="flex flex-col items-start md:items-end bg-black/15 px-4 py-1.5 rounded-lg border border-white/10 w-full md:w-auto">
        <p className="text-[11px] text-blue-100 uppercase tracking-widest font-semibold">Saldo Actual</p>
        <p className="text-16 font-bold">{formatAmount(currentAccount.currentBalance)}</p>
      </div>
    </div>
  );
}