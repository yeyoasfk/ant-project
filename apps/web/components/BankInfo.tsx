import { formatAmount, cn } from '../lib/utils'
import { CreditCard } from 'lucide-react' // Ícono genérico de tarjeta

const BankInfo = ({ account, type = "personal" }: { account: any, type?: string }) => {
  return (
    <div className="flex w-full flex-col gap-3 sm:gap-4 rounded-xl bg-blue-600 p-4 sm:p-6 shadow-md md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Ícono de Banco */}
        <div className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-blue-400/20 backdrop-blur-sm flex-shrink-0">
             <CreditCard className="text-white size-5 sm:size-6" />
        </div>
        
        <div className="flex flex-col min-w-0">
            <h2 className="text-14 sm:text-16 font-bold text-white truncate">
                {account.name}
            </h2>
            <p className="text-11 sm:text-12 font-medium text-blue-100 truncate">
                {account.type === 'credit' ? 'Tarjeta de Crédito' : 'Cuenta Corriente'} 
                {' '} • {account.mask}
            </p>
        </div>
      </div>

      {/* Saldo */}
      <div className="flex items-center justify-center rounded-lg bg-blue-500/20 px-3 sm:px-4 py-2 backdrop-blur-sm md:justify-end">
         <p className="text-18 sm:text-24 font-bold text-white truncate">
            {formatAmount(account.currentBalance)}
         </p>
      </div>
    </div>
  )
}

export default BankInfo