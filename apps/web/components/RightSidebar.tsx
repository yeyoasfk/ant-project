import Link from 'next/link'
import Image from 'next/image'
import BankStack from './BankStack'

const RightSidebar = ({ user, transactions, banks }: { user: any, transactions: any[], banks: any[] }) => {
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

      {/* 3. Sección Mis Presupuestos */}
      <section className="flex flex-col gap-4 sm:gap-6 py-6 sm:py-8 border-t border-white/10">
        <h2 className="text-16 sm:text-18 font-semibold text-white">Mis Presupuestos</h2>

        {/* Presupuesto 1 */}
        <div className="flex flex-col gap-2 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#572371]/50 transition-all duration-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="size-7 sm:size-8 rounded-full bg-red-900/50 border border-red-500/30 flex items-center justify-center text-base sm:text-lg">🍔</div>
              <span className="font-semibold text-gray-300 text-13 sm:text-14">Comida</span>
            </div>
            <span className="text-red-400 font-bold text-12 sm:text-13">$120 left</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-red-600 to-red-400 h-1.5 rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* Presupuesto 2 */}
        <div className="flex flex-col gap-2 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#572371]/50 transition-all duration-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="size-7 sm:size-8 rounded-full bg-green-900/50 border border-green-500/30 flex items-center justify-center text-base sm:text-lg">💰</div>
              <span className="font-semibold text-gray-300 text-13 sm:text-14">Ahorro</span>
            </div>
            <span className="text-green-400 font-bold text-12 sm:text-13">$50 left</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-green-600 to-green-400 h-1.5 rounded-full" style={{ width: '90%' }}></div>
          </div>
        </div>
      </section>
    </aside>
  )
}

export default RightSidebar