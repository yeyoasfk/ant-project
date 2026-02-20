import { formatAmount } from '@/lib/utils';
import { ArrowUpRight, Wallet, CheckSquare } from 'lucide-react';

const AntExpenseSummary = ({ 
  monthlyAntExpenses = 0, 
  totalCurrentBalance = 0, 
  monthlyLimit = 150000 
}: { 
  monthlyAntExpenses: number, 
  totalCurrentBalance: number, 
  monthlyLimit?: number 
}) => {
  
  // Calculamos el porcentaje asegurándonos de que no pase del 100%
  const percentage = Math.min((monthlyAntExpenses / monthlyLimit) * 100, 100);
  const formattedPercentage = percentage.toFixed(0);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 md:p-2 shadow-sm transition-all hover:shadow-md">
      
      {/* 🎯 PARTE SUPERIOR: Textos y Saldos Centrados Armónicamente */}
      <div className="flex w-full items-center justify-center gap-8 md:gap-24">
        
        {/* Gastos Hormiga */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
            <ArrowUpRight className="size-4 text-gray-400" />
            <span>Gastos Hormiga</span>
          </div>
          <p className="text-24 md:text-30 font-bold text-gray-900">
            {formatAmount(monthlyAntExpenses)}
          </p>
        </div>

        {/* Separador Vertical un poco más alto */}
        <div className="h-12 md:h-16 w-px bg-gray-200" />

        {/* Saldo Total */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
            <Wallet className="size-4 text-gray-400" />
            <span>Saldo Total</span>
          </div>
          <p className="text-24 md:text-30 font-bold text-blue-600">
            {formatAmount(totalCurrentBalance)}
          </p>
        </div>
      </div>

      {/* PARTE MEDIA: Barra de progreso gruesa */}
      <div className="relative h-10 w-full overflow-hidden rounded-full bg-gray-100 flex items-center border border-gray-200/50 shadow-inner mt-2">
        {/* Llenado oscuro */}
        <div 
          className="h-full bg-gray-900 flex items-center justify-start px-4 transition-all duration-1000 ease-in-out"
          style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '3.5rem' : '0' }}
        >
          {percentage > 5 && (
            <span className="text-sm font-bold text-white">{formattedPercentage}%</span>
          )}
        </div>
        {/* Límite al lado derecho */}
        <div className="absolute right-4 text-sm font-bold text-gray-500">
          {formatAmount(monthlyLimit)}
        </div>
      </div>

      {/* PARTE INFERIOR: Resumen */}
      <div className="flex items-center gap-2 mt-1">
        <CheckSquare className="size-5 text-blue-600" />
        <p className="text-14 font-medium text-gray-700">
          Llevas Un <span className="text-blue-600 font-bold">{formattedPercentage}%</span> De Tus Gastos Hormigas Mensuales
        </p>
      </div>
    </div>
  );
}

export default AntExpenseSummary;