import Link from 'next/link'
import BankStack from './BankStack'
import { ChevronRight } from 'lucide-react' 
import { formatAmount, getCategoryIcon } from '@/lib/utils'

const RightSidebar = ({ user, transactions, banks, categories }: { user: any, transactions: any[], banks: any[], categories: any[] }) => {
  
  // 🛡️ 0. ELIMINAR DUPLICADOS (La cura para el efecto "x2")
  // Como el Home trae datos de múltiples cuentas, filtramos usando el ID único
  // para que ninguna transacción se sume dos veces.
  const uniqueTransactions = Array.from(
    new Map(transactions.map(t => [t.id, t])).values()
  );

  // 🧠 1. Filtrar solo los egresos del mes actual usando la lista limpia
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const currentMonthExpenses = uniqueTransactions.filter(t => 
    new Date(t.date) >= firstDayOfMonth && 
    (t.type === 'debit' || t.amount < 0)
  );

  // 🧠 2. Sumar gastos usando el ID ÚNICO de la categoría
  const spentByCategoryId = currentMonthExpenses.reduce((acc: Record<string, number>, tx: any) => {
    if (tx.categoryId) {
      acc[tx.categoryId] = (acc[tx.categoryId] || 0) + Math.abs(tx.amount);
    }
    return acc;
  }, {});

  // 🧠 3. Construir los presupuestos cruzando la BD con la suma en vivo
  const dynamicBudgets = categories.map(cat => {
    return {
      id: cat.id,
      name: cat.name,
      icon: getCategoryIcon(cat.name), // 👈 Emojis dinámicos
      color: cat.color || '#9d6dc0',
      limit: Number(cat.budget_limit) || 1,
      spent: spentByCategoryId[cat.id] || 0 // 👈 Suma exacta sin duplicados
    };
  });

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

      {/* 3. Sección Mis Presupuestos DINÁMICA */}
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

        {/* Mapeo Dinámico de Presupuestos Reales */}
        <div className="flex flex-col gap-4">
          {dynamicBudgets
            .filter((budget) => budget.spent > 0) // Oculta las categorías en $0
            .sort((a, b) => b.spent - a.spent) // Ordena de mayor a menor gasto
            .map((budget) => {
              const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
              const isDanger = percentage >= 90;
              
              return (
                <Link
                href={`/categorias?categoryId=${budget.id}`}
                key={budget.id} className="flex flex-col gap-2 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#572371]/50 transition-all duration-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="size-7 sm:size-8 rounded-full border flex items-center justify-center text-base sm:text-lg"
                        style={{ backgroundColor: `${budget.color}20`, borderColor: `${budget.color}50` }}
                      >
                        {budget.icon}
                      </div>
                      <span className="font-semibold text-gray-300 text-13 sm:text-14">{budget.name}</span>
                    </div>
                    {/* Monto restante y límite */}
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-12 sm:text-13" style={{ color: budget.color }}>
                        {formatAmount(budget.spent)}
                      </span>
                      <span className="text-gray-500 text-[10px] font-medium">
                        de {formatAmount(budget.limit)}
                      </span>
                    </div>
                  </div>
                  {/* Barra de progreso dinámica */}
                  <div className="w-full bg-white/10 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-1000 ${isDanger ? 'bg-red-500' : ''}`} 
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: isDanger ? undefined : budget.color 
                      }}
                    />
                  </div>
                </Link>
              );
            })}

            {/* Mensaje si no hay presupuestos usados */}
            {dynamicBudgets.filter((b) => b.spent > 0).length === 0 && (
              <p className="text-13 text-gray-500 italic mt-2 text-center bg-white/5 py-4 rounded-xl border border-dashed border-white/10">
                Aún no tienes gastos registrados en tus categorías este mes.
              </p>
            )}
        </div>
      </section>
    </aside>
  )
}

export default RightSidebar