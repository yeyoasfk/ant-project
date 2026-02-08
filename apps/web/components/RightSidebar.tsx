import Link from 'next/link'
import Image from 'next/image'
import BankStack from './BankStack' // Importamos el nuevo componente

const RightSidebar = ({ user, transactions, banks }: { user: any, transactions: any[], banks: any[] }) => {
  return (
    <aside className="no-scrollbar hidden h-screen max-h-screen flex-col border-l border-gray-200 xl:flex w-[355px] pt-8 bg-gray-50">
      
      {/* 1. Sección de Perfil */}
      <section className="flex flex-col pb-8">
        <div className="h-[120px] w-full bg-gradient-to-r from-blue-400 to-purple-500 bg-cover bg-no-repeat" />
        <div className="relative flex px-6 max-xl:justify-center">
          <div className="flex-center absolute -top-8 size-24 rounded-full border-4 border-white bg-gray-200 shadow-profile flex items-center justify-center text-3xl font-bold text-gray-500 overflow-hidden">
             {user.firstName[0]} 
          </div>
          <div className="flex flex-col pt-20">
            <h1 className="text-24 font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-16 font-normal text-gray-600">
              {user.email}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Sección Mis Bancos */}
      <section className="flex flex-col justify-between gap-8 px-6 py-8">
        <div className="flex w-full justify-between items-center">
          <h2 className="text-18 font-semibold text-gray-900">Mis Bancos</h2>
          
          {/* ✅ CORRECCIÓN: Botón lleva a /connect-bank (Ventana Fintoc) */}
          <Link href="/connect-bank" className="flex gap-2 items-center text-14 font-semibold text-gray-600 hover:text-blue-600">
            <span className="text-xl font-bold">+</span>
            <span>Agregar</span>
          </Link>
        </div>

        {/* ✅ Usamos el nuevo componente BankStack */}
        <BankStack banks={banks} user={user} />
        
      </section>

      {/* 3. Sección Mis Presupuestos */}
      <section className="flex flex-col gap-6 px-6 py-4">
         <h2 className="text-18 font-semibold text-gray-900">Mis Presupuestos</h2>
         
         <div className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">🍔</div>
                    <span className="font-semibold text-gray-700">Comida</span>
                </div>
                <span className="text-red-500 font-bold">$120 left</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
            </div>
         </div>

         <div className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">💰</div>
                    <span className="font-semibold text-gray-700">Ahorro</span>
                </div>
                <span className="text-green-500 font-bold">$50 left</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
            </div>
         </div>
      </section>
    </aside>
  )
}

export default RightSidebar