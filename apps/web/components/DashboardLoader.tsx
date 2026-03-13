/**
 * Server Component: DashboardLoader
 * 
 * Encapsula TODA la lógica bloqueante del dashboard:
 * - getDetailedAccounts()
 * - getAccountMovements()
 * - Promise.all(getAntExpenses)
 * 
 * Se renderiza dentro de un <Suspense> permitiendo que la página
 * muestre el HeaderBox instantáneamente mientras esto carga.
 */

import TotalBalanceBox from './TotalBalanceBox'
import RecentTransactions from './RecentTransactions'
import AntExpenseSummary from './AntExpenseSummary'
import RightSidebar from './RightSidebar'
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

  // 🔄 AWAIT BLOQUEANTE #1: Obtener detalles de todas las cuentas desde Fintoc
  const allAccounts = await getDetailedAccounts(dbLinks)

  // Determinar cuenta seleccionada
  const currentAccount = urlAccountId
    ? allAccounts.find(a => a.fintocAccountId === urlAccountId) || allAccounts[0]
    : allAccounts[0]

  // 🔄 AWAIT BLOQUEANTE #2: Obtener movimientos de la cuenta seleccionada
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

  // 🔄 AWAIT BLOQUEANTE #3: Obtener gastos globales de TODAS las cuentas
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

  // 🧠 Sanitizar y procesar gastos globales
  const sanitizedGlobalExpenses = rawGlobalExpenses
    .map((e: any) => ({
      ...e,
      amount: typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0,
      date: e.date ? new Date(e.date) : new Date(),
    }))
    .filter((e: any) => e.id && !isNaN(e.amount))
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  // 🐜 Calcular gastos hormiga del mes actual
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthlyAntExpenses = sanitizedGlobalExpenses
    .filter((e: any) => {
      const isThisMonth = e.date >= firstDayOfMonth
      const isExpense = e.type === 'debit' || e.amount < 0
      const isActuallyAnt = e.antCategory === 'Gasto Hormiga'

      return isThisMonth && isExpense && isActuallyAnt
    })
    .reduce((acc: number, curr: any) => acc + Math.abs(curr.amount), 0)

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
        {/* BANNER PRINCIPAL */}
        <TotalBalanceBox
          accounts={allAccounts}
          totalBanks={totalBanks}
          totalCurrentBalance={totalCurrentBalance}
        />

        {/* 🆕 BANNER DE GASTOS HORMIGA */}
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

      {/* RightSidebar - Oculto en mobile y tablet, visible en lg+ */}
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
