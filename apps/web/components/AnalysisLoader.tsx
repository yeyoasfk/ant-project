/**
 * Server Component: AnalysisLoader
 * 
 * Encapsula TODA la lógica bloqueante de la página de análisis:
 * - getDetailedAccounts()
 * - getAccountMovements()
 * - Promise.all(getAntExpenses)
 * 
 * Se renderiza dentro de un <Suspense> permitiendo que el HeaderBox
 * se muestre instantáneamente mientras esto carga.
 */

import AntExpenseSummary from './AntExpenseSummary'
import IncomeExpenseChart from './IncomeExpenseChart'
import MiniBankDropdown from './MiniBankDropdown'
import { getAntExpenses, getDetailedAccounts, getAccountMovements } from '@/lib/actions/bank.actions'

interface AnalysisLoaderProps {
  dbLinks: any[]
  urlAccountId?: string
}

export default async function AnalysisLoader({
  dbLinks,
  urlAccountId,
}: AnalysisLoaderProps) {
  // 🔄 AWAIT BLOQUEANTE #1: Obtener detalles de todas las cuentas desde Fintoc
  const allAccounts = await getDetailedAccounts(dbLinks)
  const totalCurrentBalance = allAccounts.reduce(
    (acc, curr) => acc + (curr.currentBalance || 0),
    0
  )

  // 🎯 Identificar cuenta seleccionada
  const currentAccount = urlAccountId
    ? allAccounts.find(a => a.fintocAccountId === urlAccountId) || allAccounts[0]
    : allAccounts[0]

  // 🔄 AWAIT BLOQUEANTE #2: Obtener movimientos específicos de la cuenta seleccionada
  let currentAccountTransactions: any[] = []
  if (currentAccount) {
    const rawAccountMoves = await getAccountMovements(
      currentAccount.linkToken,
      currentAccount.fintocAccountId
    )
    currentAccountTransactions = rawAccountMoves.map((t: any) => ({
      ...t,
      amount: typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0,
    }))
  }

  // 🔄 AWAIT BLOQUEANTE #3: Obtener gastos hormiga globales de TODAS las cuentas
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

  // 🐜 Calcular gastos hormiga del mes actual
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthlyAntExpenses = rawGlobalExpenses
    .map((e: any) => ({ ...e, date: e.date ? new Date(e.date) : new Date() }))
    .filter((e: any) => {
      const isThisMonth = e.date >= firstDayOfMonth
      const isExpense = e.type === 'debit' || e.amount < 0
      const isActuallyAnt = e.antCategory === 'Gasto Hormiga'

      return isThisMonth && isExpense && isActuallyAnt
    })
    .reduce((acc: number, curr: any) => acc + Math.abs(curr.amount), 0)

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* 1. BANNER GLOBAL DE GASTOS HORMIGA */}
      <AntExpenseSummary
        monthlyAntExpenses={monthlyAntExpenses}
        totalCurrentBalance={totalCurrentBalance}
        monthlyLimit={150000}
      />

      {/* 2. SELECTOR DE BANCO COMPACTO */}
      <MiniBankDropdown
        accounts={allAccounts}
        currentAccountId={currentAccount.fintocAccountId}
      />

      {/* 3. GRÁFICO (Ahora solo muestra datos del banco seleccionado) */}
      <IncomeExpenseChart transactions={currentAccountTransactions} />
    </div>
  )
}
