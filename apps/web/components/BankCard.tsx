import Link from 'next/link'
import { formatAmount, cn } from '../lib/utils'

interface CreditCardProps {
  account: any;
  userName: string;
  showBalance?: boolean;
  color?: string;
  isLink?: boolean;
  isGlass?: boolean;
}

const BankCard = ({
  account,
  userName,
  showBalance = true,
  color = "blue",
  isLink = true,
  isGlass = false,
}: CreditCardProps) => {

  // 🛡️ VALIDACIÓN Y SANITIZACIÓN
  if (!account) {
    return (
      <div className="flex h-32 sm:h-40 w-full max-w-sm items-center justify-center rounded-2xl sm:rounded-3xl border border-white/10 bg-[#1f1019]/60">
        <p className="text-13 sm:text-14 text-gray-400">Error: Cuenta no disponible</p>
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

  // 3. Definimos el estilo del fondo – sólido o cristal según la prop isGlass
  const bgStyle = isGlass
    ? "bg-white/10 backdrop-blur-xl border-white/30"
    : "bg-bank-gradient";

  // 4. Contenido visual de la tarjeta
  const CardContent = () => (
    <>
      {/* Lado Izquierdo: Información */}
      <div className="relative z-10 flex size-full flex-col justify-between rounded-l-2xl sm:rounded-l-3xl bg-black/20 px-3 sm:px-5 pb-3 sm:pb-4 pt-3 sm:pt-5">
        <div>
          <h1 className="text-13 sm:text-16 font-semibold text-white/90 truncate max-w-24 sm:max-w-40 tracking-wide" title={safeBankName}>
            {safeBankName}
          </h1>
          <p className="font-ibm-plex-serif font-black text-white text-14 sm:text-18 mt-1">
            {formatAmount(safeBalance)}
          </p>
        </div>

        <div className="flex flex-col gap-1 sm:gap-2">
          <div className="flex justify-between gap-2">
            <h1 className="text-11 sm:text-12 font-medium text-white/70 truncate max-w-20 sm:max-w-32 tracking-wider uppercase" title={safeUserName}>
              {safeUserName}
            </h1>
            <h2 className="text-11 sm:text-12 font-medium text-white/70 flex-shrink-0 tracking-widest">
              ●● / ●●
            </h2>
          </div>
          <p className="text-12 sm:text-14 font-mono font-semibold tracking-[0.2em] text-white/90">
            ●●●● ●●●● ●●●● <span className="text-13 sm:text-16 text-white">{safeMask}</span>
          </p>
        </div>
      </div>

      {/* Lado Derecho: Diseño Visual (Visa/Mastercard) */}
      <div className="flex size-full flex-col items-end justify-between rounded-r-2xl sm:rounded-r-3xl bg-cover bg-center bg-no-repeat py-3 sm:py-5 pr-3 sm:pr-5">
        <div className="text-white/60 font-medium text-10 sm:text-xs uppercase tracking-widest truncate max-w-16 sm:max-w-20" title={accountTypeLabel}>
          {accountTypeLabel}
        </div>
        <div className="flex flex-col items-end gap-1">
          {color === 'purple' ? (
            /* Mastercard – dos círculos solapados */
            <div className="flex items-center -space-x-2">
              <div className="size-6 sm:size-8 rounded-full bg-red-500/80 backdrop-blur-sm" />
              <div className="size-6 sm:size-8 rounded-full bg-yellow-400/80 backdrop-blur-sm" />
            </div>
          ) : (
            /* VISA */
            <span className="text-white font-extrabold text-xl sm:text-3xl italic tracking-tight select-none">
              VISA
            </span>
          )}
        </div>
      </div>
    </>
  );

  const cardClasses = cn(
    "relative flex h-32 sm:h-40 md:h-48 w-full max-w-sm justify-between",
    "rounded-2xl sm:rounded-3xl border border-white/20",
    "shadow-creditCard backdrop-blur-[6px]",
    "transition-all duration-500 ease-in-out select-none cursor-pointer",
    "hover:opacity-95 hover:shadow-glow-purple hover:-translate-y-0.5",
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
          <div className="flex justify-between text-10 sm:text-xs font-medium text-gray-400">
            <span>Gastado este mes</span>
            <span className="text-[#9d6dc0] font-bold truncate text-11 sm:text-xs">
              {formatAmount(spentThisMonth)} / {formatAmount(monthlyLimit)}
            </span>
          </div>

          <div className="h-1.5 sm:h-2 w-full rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#572371] to-[#653584] shadow-[0_0_6px_rgba(101,53,132,0.8)]"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BankCard