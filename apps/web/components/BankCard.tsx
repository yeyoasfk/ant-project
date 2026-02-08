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
  
  // 1. Definimos el estilo del fondo (Azul o Morado)
  const bgStyle = color === "purple" 
    ? "bg-gradient-to-r from-purple-500 to-indigo-600"
    : "bg-bank-gradient";

  // 2. Creamos el contenido visual de la tarjeta (para no repetirlo)
  const CardContent = () => (
    <>
        {/* Lado Izquierdo: Información */}
        <div className="relative z-10 flex size-full flex-col justify-between rounded-l-[20px] bg-gray-700/10 px-5 pb-4 pt-5">
          <div>
            <h1 className="text-16 font-semibold text-white">
              {account.name || userName}
            </h1>
            <p className="font-ibm-plex-serif font-black text-white">
              {formatAmount(account.currentBalance)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-12 font-semibold text-white">
                {userName}
              </h1>
              <h2 className="text-12 font-semibold text-white">
                ●● / ●●
              </h2>
            </div>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● <span className="text-16">{account.mask || '1234'}</span>
            </p>
          </div>
        </div>

        {/* Lado Derecho: Diseño Visual (Visa/Mastercard) */}
        <div className="flex size-full flex-col items-end justify-between rounded-r-[20px] bg-cover bg-center bg-no-repeat py-5 pr-5">
           <div className="text-white font-bold text-xs uppercase">Paypass</div>
           <div className="flex flex-col items-end">
               {color === 'purple' ? (
                   <span className="text-white font-bold text-2xl italic">Mastercard</span>
               ) : (
                   <span className="text-white font-bold text-2xl italic">VISA</span>
               )}
           </div>
        </div>
    </>
  );

  // Clases comunes para el contenedor de la tarjeta
  const cardClasses = cn(
    "relative flex h-[190px] w-full max-w-[320px] justify-between rounded-[20px] border border-white shadow-creditCard backdrop-blur-[6px] transition-all duration-500 ease-in-out select-none",
    bgStyle
  );

  return (
    <div className="flex flex-col">
      {/* 3. Renderizamos la Tarjeta (Como Link o como Div simple) */}
      {isLink ? (
        <Link href={`/transaction-history/?id=${account.id}`} className={cardClasses}>
          <CardContent />
        </Link>
      ) : (
        <div className={cardClasses}>
          <CardContent />
        </div>
      )}

      {/* 4. Barra de Progreso (Límite Mensual) - Solo si showBalance es true */}
      {showBalance && (
        <div className="mt-3 flex flex-col gap-1 px-1">
           <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Gastado este mes</span>
              {/* Aquí simulamos un gasto vs límite */}
              <span className="text-blue-600 font-bold">$250.000 / $500.000</span>
           </div>
           
           {/* Barra de fondo */}
           <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              {/* Barra de progreso (Azul o Morada según el tema) */}
              <div 
                className={cn("h-full rounded-full", color === 'purple' ? 'bg-purple-500' : 'bg-blue-600')} 
                style={{ width: '50%' }}
              ></div>
           </div>
        </div>
      )}
    </div>
  )
}

export default BankCard