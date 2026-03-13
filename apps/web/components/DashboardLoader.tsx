import TotalBalanceBox from './TotalBalanceBox'
import RecentTransactions from './RecentTransactions'
import AntExpenseSummary from './AntExpenseSummary'
import RightSidebar from './RightSidebar'
import CashFlowSummary from './CashFlowSummary' // 👈 Importamos el nuevo componente
import { createClient } from '@/lib/supabase/server'
import { getDetailedAccounts, getAccountMovements, getAntExpenses } from '@/lib/actions/bank.actions'

interface DashboardLoaderProps {
  dbLinks: any[]
  loggedInUser: {
    firstName: string
    lastName: string
    email: string
  }
  urlAccountId?: string
}

export default async function DashboardLoader({
  dbLinks,
  loggedInUser,
  urlAccountId,
}: DashboardLoaderProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 🔄 AWAIT BLOQUEANTE #1: Obtener detalles
  const allAccounts = await getDetailedAccounts(dbLinks)

  const currentAccount = urlAccountId
    ? allAccounts.find(a => a.fintocAccountId === urlAccountId) || allAccounts[0]
    : allAccounts[0]

  // 🔄 AWAIT BLOQUEANTE #2: Obtener movimientos de cuenta actual
  let currentAccountTransactions: any[] = []
  if (currentAccount) {
    const rawAccountMoves = await getAccountMovements(
      currentAccount.linkToken,
      currentAccount.fintocAccountId
    )
    currentAccountTransactions = rawAccountMoves.map((t: any) => ({
      ...t,
      amount: Math.abs(t.amount),
    }))
  }

  // 🔄 AWAIT BLOQUEANTE #3: Obtener gastos globales
  let rawGlobalExpenses: any[] = []
  const accountsWithFintocId = dbLinks.filter(acc => acc.fintoc_id)
  if (accountsWithFintocId.length > 0) {
    try {
      const expensesPromises = accountsWithFintocId.map(account =>
        getAntExpenses(account.fintoc_id)
      )
      const results = await Promise.all(expensesPromises)
      rawGlobalExpenses = results.flat()
    } catch (error) {
      console.error('❌ Error obteniendo gastos globales:', error)
    }
  }

  const sanitizedGlobalExpenses = rawGlobalExpenses
    .map((e: any) => ({
      ...e,
      amount: typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0,
      date: e.date ? new Date(e.date) : new Date(),
    }))
    .filter((e: any) => e.id && !isNaN(e.amount))
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  // 🧮 NUEVA LÓGICA DE CÁLCULO: Ingresos vs Egresos del mes
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  let totalIncomeThisMonth = 0;
  let totalExpensesThisMonth = 0;
  let monthlyAntExpenses = 0;

  sanitizedGlobalExpenses.forEach((e: any) => {
    const isThisMonth = e.date >= firstDayOfMonth;
    
    if (isThisMonth) {
      // Si el monto es positivo o el tipo es crédito -> INGRESO
      if (e.amount > 0 || e.type === 'credit') {
        totalIncomeThisMonth += Math.abs(e.amount);
      } 
      // Si el monto es negativo o el tipo es débito -> EGRESO
      else if (e.amount < 0 || e.type === 'debit') {
        const expenseAbsolute = Math.abs(e.amount);
        totalExpensesThisMonth += expenseAbsolute;
        
        // Sumar a gastos hormiga si corresponde
        if (e.antCategory === 'Gasto Hormiga') {
          monthlyAntExpenses += expenseAbsolute;
        }
      }
    }
  });

  // Saldo Libre (Ingresos - Gastos Totales)
  const freeCash = totalIncomeThisMonth - totalExpensesThisMonth;

  // Obtener categorías
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user?.id)

  const totalBanks = allAccounts.length
  const totalCurrentBalance = allAccounts.reduce(
    (acc, curr) => acc + (curr.currentBalance || 0),
    0
  )

  return (
    <>
      <div className="flex w-full flex-1 flex-col gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 py-6 sm:py-8 overflow-y-auto">
        
        {/* BANNER PRINCIPAL (Saldo Total Bancos) */}
        <TotalBalanceBox
          accounts={allAccounts}
          totalBanks={totalBanks}
          totalCurrentBalance={totalCurrentBalance}
        />

        {/* 🆕 NUEVO BANNER: FLUJO DE CAJA (Ingresos vs Egresos) */}
        <CashFlowSummary 
          totalIncome={totalIncomeThisMonth}
          totalExpenses={totalExpensesThisMonth}
          freeCash={freeCash}
        />

        {/* BANNER DE GASTOS HORMIGA (Original) */}
        <AntExpenseSummary
          monthlyAntExpenses={monthlyAntExpenses}
          totalCurrentBalance={totalCurrentBalance}
          monthlyLimit={150000}
        />

        {/* PESTAÑAS Y TABLA */}
        <RecentTransactions
          accounts={allAccounts}
          transactions={currentAccountTransactions}
          currentAccountId={currentAccount.fintocAccountId}
        />
      </div>

      {/* RightSidebar */}
      <div className="hidden lg:block">
        <RightSidebar
          user={loggedInUser}
          transactions={sanitizedGlobalExpenses}
          banks={allAccounts.slice(0, 2)}
          categories={categories || []}
        />
      </div>
    </>
  )
}