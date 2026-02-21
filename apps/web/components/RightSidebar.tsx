import Link from 'next/link'
import Image from 'next/image'
import BankStack from './BankStack'
import { ChevronRight } from 'lucide-react' // 👈 Importamos el ícono de la flecha
import { formatAmount } from '@/lib/utils'

const RightSidebar = ({ user, transactions, banks }: { user: any, transactions: any[], banks: any[] }) => {
  
  // 🧠 SIMULACIÓN DE DATOS (Luego vendrán de Supabase)
  // Nota como "Transporte" tiene 0 gastado. La lógica lo ocultará automáticamente.
  const budgets = [
    { id: '1', name: 'Comida', icon: '🍔', spent: 38000, limit: 50000, color: 'from-red-600 to-red-400', bgIcon: 'bg-red-900/50 border-red-500/30', textAmount: 'text-red-400' },
    { id: '2', name: 'Transporte', icon: '🚌', spent: 0, limit: 30000, color: 'from-yellow-600 to-yellow-400', bgIcon: 'bg-yellow-900/50 border-yellow-500/30', textAmount: 'text-yellow-400' },
    { id: '3', name: 'Ahorro', icon: '💰', spent: 45000, limit: 50000, color: 'from-green-600 to-green-400', bgIcon: 'bg-green-900/50 border-green-500/30', textAmount: 'text-green-400' }
  ];

  return (
    <aside className="hidden lg:flex flex-col border-l border-white/10 min-h-screen w-72 2xl:w-96 pt-6 sm:pt-8 bg-[#1f1019]/50 backdrop-blur-xl px-4 sm:px-6 overflow-y-auto custom-scrollbar">

      {/* 1. Sección de Perfil */}
      <section className="flex flex-col pb-8 sm:pb-10">
        <div className="h-20 sm:h-28 w-full bg-gradient-to-r from-[#3b174d] via-[#572371] to-[#653584] rounded-t-xl" />
        <div className="relative flex px-4 sm:px-6">
          <div className="flex-center absolute -top-10 sm:-top-12 size-20 sm:size-24 rounded-full border-4 border-[#1f1019] bg-[#3b174d] shadow-glow-purple flex items-center justify-center text-2xl sm:text-3xl font-bold text-white/80 overflow-hidden">
            {user.firstName[0]}
          </div>
          <div className="flex flex-col pt-12 sm:pt-16 gap-1">
            <h1 className="text-16 sm:text-20 font-semibold text-white">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-13 sm:text-15 font-normal text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Sección Mis Bancos */}
      <section className="flex flex-col justify-between gap-6 sm:gap-8 py-6 sm:py-8 border-t border-white/10">
        <div className="flex w-full justify-between items-center">
          <h2 className="text-16 sm:text-18 font-semibold text-white">Mis Bancos</h2>

          {/* Botón Agregar */}
          <Link
            href="/connect-bank"
            className="flex gap-2 items-center text-12 sm:text-14 font-semibold text-gray-400 hover:text-[#9d6dc0] transition-colors"
          >
            <span className="text-lg sm:text-xl font-bold">+</span>
            <span>Agregar</span>
          </Link>
        </div>

        {/* Componente BankStack */}
        <BankStack banks={banks} user={user} />
      </section>

      {/* 3. Sección Mis Presupuestos (AHORA ES DINÁMICA Y CLICKEABLE) */}
      <section className="flex flex-col gap-4 sm:gap-6 py-6 sm:py-8 border-t border-white/10">
        
        {/* Título Clickeable */}
        <Link 
          href="/categorias" 
          className="flex items-center justify-between group cursor-pointer"
        >
          <h2 className="text-16 sm:text-18 font-semibold text-white group-hover:text-[#9d6dc0] transition-colors">
            Mis Presupuestos
          </h2>
          <ChevronRight className="size-5 text-gray-400 group-hover:text-[#9d6dc0] transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Mapeo Dinámico de Presupuestos */}
        <div className="flex flex-col gap-4">
          {budgets
            .filter((budget) => budget.spent > 0) // 👈 LA REGLA DE ORO: Ocultar los de $0
            .map((budget) => {
              const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
              
              return (
                <div key={budget.id} className="flex flex-col gap-2 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#572371]/50 transition-all duration-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`size-7 sm:size-8 rounded-full border flex items-center justify-center text-base sm:text-lg ${budget.bgIcon}`}>
                        {budget.icon}
                      </div>
                      <span className="font-semibold text-gray-300 text-13 sm:text-14">{budget.name}</span>
                    </div>
                    {/* Monto restante y límite */}
                    <div className="flex flex-col items-end">
                      <span className={`${budget.textAmount} font-bold text-12 sm:text-13`}>
                        {formatAmount(budget.spent)}
                      </span>
                      <span className="text-gray-500 text-[10px] font-medium">
                        de {formatAmount(budget.limit)}
                      </span>
                    </div>
                  </div>
                  {/* Barra de progreso dinámica */}
                  <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full bg-gradient-to-r ${budget.color}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Mensaje si no hay presupuestos usados */}
            {budgets.filter((b) => b.spent > 0).length === 0 && (
              <p className="text-13 text-gray-500 italic mt-2 text-center">
                Aún no tienes gastos registrados este mes.
              </p>
            )}
        </div>
      </section>
    </aside>
  )
}

export default RightSidebar