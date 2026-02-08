'use client'

import { formatAmount } from '../lib/utils'; // ✅ Ahora sí funciona este import
import CountUp from 'react-countup';
import DoughnutChart from './DoughnutChart';

const TotalBalanceBox = ({
  accounts = [], 
  totalBanks, 
  totalCurrentBalance 
}: { accounts: any[], totalBanks: number, totalCurrentBalance: number }) => {
  return (
    <section className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 shadow-chart sm:gap-6 sm:p-6 bg-white">
      <div className="flex size-full max-w-[100px] items-center sm:max-w-[120px]">
        <DoughnutChart accounts={accounts} />
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-18 font-semibold text-gray-900">
          {totalBanks} Cuentas Bancarias
        </h2>
        <div className="flex flex-col gap-2">
          <p className="text-14 font-medium text-gray-600">
            Saldo Total Actual
          </p>

          <div className="text-24 lg:text-30 flex-1 font-semibold text-gray-900 flex items-center gap-2">
            {/* Usamos CountUp para la animación del número */}
            <CountUp 
              end={totalCurrentBalance} 
              decimal=","
              prefix="$"
              duration={2}
              formattingFn={(value) => formatAmount(value)} // Usamos nuestra utilidad aquí
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TotalBalanceBox;