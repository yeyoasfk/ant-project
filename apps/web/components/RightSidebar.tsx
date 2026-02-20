import Link from 'next/link'
import Image from 'next/image'
import BankStack from './BankStack'

const RightSidebar = ({ user, transactions, banks }: { user: any, transactions: any[], banks: any[] }) => {
  return (
    <aside className="hidden lg:flex flex-col border-l border-gray-200 min-h-screen w-72 2xl:w-96 pt-6 sm:pt-8 bg-gray-50 px-4 sm:px-6 overflow-y-auto custom-scrollbar">
      
      {/* 1. Sección de Perfil */}
      <section className="flex flex-col pb-8 sm:pb-10">
        <div className="h-20 sm:h-28 w-full bg-gradient-to-r from-blue-400 to-purple-500 bg-cover bg-no-repeat rounded-t-lg" />
        <div className="relative flex px-4 sm:px-6">
          <div className="flex-center absolute -top-10 sm:-top-12 size-20 sm:size-24 rounded-full border-4 border-white bg-gray-200 shadow-profile flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-500 overflow-hidden">
             {user.firstName[0]} 
          </div>
          <div className="flex flex-col pt-12 sm:pt-16 gap-1">
            <h1 className="text-16 sm:text-20 font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-13 sm:text-15 font-normal text-gray-600 truncate">
              {user.email}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Sección Mis Bancos */}
      <section className="flex flex-col justify-between gap-6 sm:gap-8 py-6 sm:py-8 border-t border-gray-200">
        <div className="flex w-full justify-between items-center">
          <h2 className="text-16 sm:text-18 font-semibold text-gray-900">Mis Bancos</h2>
          
          {/* Botón Agregar */}
          <Link 
            href="/connect-bank" 
            className="flex gap-2 items-center text-12 sm:text-14 font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span className="text-lg sm:text-xl font-bold">+</span>
            <span>Agregar</span>
          </Link>
        </div>

        {/* Componente BankStack */}
        <BankStack banks={banks} user={user} />
      </section>

      {/* 3. Sección Mis Presupuestos */}
      <section className="flex flex-col gap-4 sm:gap-6 py-6 sm:py-8 border-t border-gray-200">
         <h2 className="text-16 sm:text-18 font-semibold text-gray-900">Mis Presupuestos</h2>
         
         {/* Presupuesto 1 */}
         <div className="flex flex-col gap-2 p-3 sm:p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="size-7 sm:size-8 rounded-full bg-red-100 flex items-center justify-center text-base sm:text-lg">🍔</div>
                    <span className="font-semibold text-gray-700 text-13 sm:text-14">Comida</span>
                </div>
                <span className="text-red-500 font-bold text-12 sm:text-13">$120 left</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
         </div>

         {/* Presupuesto 2 */}
         <div className="flex flex-col gap-2 p-3 sm:p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="size-7 sm:size-8 rounded-full bg-green-100 flex items-center justify-center text-base sm:text-lg">💰</div>
                    <span className="font-semibold text-gray-700 text-13 sm:text-14">Ahorro</span>
                </div>
                <span className="text-green-500 font-bold text-12 sm:text-13">$50 left</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
         </div>
      </section>
    </aside>
  )
}

export default RightSidebar