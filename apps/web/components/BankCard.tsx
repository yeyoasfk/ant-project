import Link from 'next/link'
import { formatAmount, cn } from '../lib/utils'

interface CreditCardProps {
  account: any;
  userName: string;
  showBalance?: boolean;
  color?: string;
  isLink?: boolean; 
}

const BankCard = ({ 
  account, 
  userName, 
  showBalance = true, 
  color = "blue",
  isLink = true 
}: CreditCardProps) => {
  
  // 🛡️ VALIDACIÓN Y SANITIZACIÓN
  if (!account) {
    return (
      <div className="flex h-32 sm:h-40 w-full max-w-sm items-center justify-center rounded-2xl sm:rounded-3xl border border-gray-300 bg-gray-100">
        <p className="text-13 sm:text-14 text-gray-500">Error: Cuenta no disponible</p>
      </div>
    );
  }

  // 1. Extracción Segura de Datos
  const safeBalance = account.currentBalance || 0;
  // Fintoc entrega el nombre corto de la cuenta en "name" (ej. "Cuenta Vista") y el banco en "institutionName"
  const safeBankName = account.institutionName || account.name || 'Banco Desconocido';
  const accountTypeLabel = account.name || 'Cuenta'; 
  const safeMask = account.number ? account.number.slice(-4) : '****';
  const safeUserName = userName || 'Usuario';

  // 2. Lógica de la Barra de Gastos
  // Límite Mensual Dinámico: Si tu sueldo/ingreso normal no está seteado, usamos un valor base razonable.
  // Aquí asumo un límite de 1.000.000 CLP para que la barra se mueva, pero puedes ajustarlo.
  const monthlyLimit = 1000000; 
  const spentThisMonth = account.spentThisMonth || 0;
  
  // Calculamos el porcentaje, asegurando que no pase del 100%
  const progressPercentage = Math.min((spentThisMonth / monthlyLimit) * 100, 100);

  // 3. Definimos el estilo del fondo
  const bgStyle = color === "purple" 
    ? "bg-gradient-to-r from-purple-500 to-indigo-600"
    : "bg-bank-gradient";

  // 4. Contenido visual de la tarjeta
  const CardContent = () => (
    <>
        {/* Lado Izquierdo: Información */}
        <div className="relative z-10 flex size-full flex-col justify-between rounded-l-2xl sm:rounded-l-3xl bg-gray-700/10 px-3 sm:px-5 pb-3 sm:pb-4 pt-3 sm:pt-5">
          <div>
            <h1 className="text-13 sm:text-16 font-semibold text-white truncate max-w-24 sm:max-w-40" title={safeBankName}>
              {safeBankName}
            </h1>
            <p className="font-ibm-plex-serif font-black text-white text-14 sm:text-18">
              {formatAmount(safeBalance)}
            </p>
          </div>

          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex justify-between gap-2">
              <h1 className="text-11 sm:text-12 font-semibold text-white truncate max-w-20 sm:max-w-32" title={safeUserName}>
                {safeUserName}
              </h1>
              <h2 className="text-11 sm:text-12 font-semibold text-white flex-shrink-0">
                ●● / ●●
              </h2>
            </div>
            <p className="text-12 sm:text-14 font-semibold tracking-wider text-white">
              ●●●● ●●●● ●●●● <span className="text-13 sm:text-16">{safeMask}</span>
            </p>
          </div>
        </div>

        {/* Lado Derecho: Diseño Visual (Visa/Mastercard) */}
        <div className="flex size-full flex-col items-end justify-between rounded-r-2xl sm:rounded-r-3xl bg-cover bg-center bg-no-repeat py-3 sm:py-5 pr-3 sm:pr-5">
           <div className="text-white font-bold text-10 sm:text-xs uppercase truncate max-w-16 sm:max-w-20" title={accountTypeLabel}>
             {accountTypeLabel}
           </div>
           <div className="flex flex-col items-end">
               {color === 'purple' ? (
                   <span className="text-white font-bold text-lg sm:text-2xl italic">Mastercard</span>
               ) : (
                   <span className="text-white font-bold text-lg sm:text-2xl italic">VISA</span>
               )}
           </div>
        </div>
    </>
  );

  const cardClasses = cn(
    "relative flex h-32 sm:h-40 md:h-48 w-full max-w-sm justify-between rounded-2xl sm:rounded-3xl border border-white shadow-creditCard backdrop-blur-[6px] transition-all duration-500 ease-in-out select-none cursor-pointer hover:opacity-90",
    bgStyle
  );

  return (
    <div className="flex flex-col w-full max-w-sm">
      {/* TARJETA */}
      {isLink && account.fintocAccountId ? (
        <Link href={`/transaction-history/?id=${account.fintocAccountId}`} className={cardClasses}>
          <CardContent />
        </Link>
      ) : (
        <div className={cardClasses}>
          <CardContent />
        </div>
      )}

      {/* BARRA DE PROGRESO (GASTO MENSUAL) */}
      {showBalance && (
        <div className="mt-2 sm:mt-3 flex flex-col gap-1 px-1">
           <div className="flex justify-between text-10 sm:text-xs font-medium text-gray-600">
             <span>Gastado este mes</span>
             <span className="text-blue-600 font-bold truncate text-11 sm:text-xs">
               {formatAmount(spentThisMonth)} / {formatAmount(monthlyLimit)}
             </span>
           </div>
           
           <div className="h-1.5 sm:h-2 w-full rounded-full bg-gray-200 overflow-hidden relative">
             <div 
               className={cn("h-full rounded-full transition-all duration-1000", color === 'purple' ? 'bg-purple-500' : 'bg-blue-600')} 
               style={{ width: `${progressPercentage}%` }}
             ></div>
           </div>
        </div>
      )}
    </div>
  )
}

export default BankCard