/**
 * Server Component: BanksLoader
 * 
 * Encapsula TODA la lógica bloqueante de la página de mis bancos:
 * - getDetailedAccounts()
 * - Promise.all(getAccountMovements) para cada cuenta
 * 
 * Se renderiza dentro de un <Suspense> permitiendo que el header
 * se muestre instantáneamente mientras esto carga.
 */

import { CreditCard, Landmark } from 'lucide-react'
import BankCard from './BankCard'
import AccountToggle from './AccountToggle'
import { getDetailedAccounts, getAccountMovements } from '@/lib/actions/bank.actions'

interface BanksLoaderProps {
  dbLinks: any[]
  firstName: string
  lastName: string
}

export default async function BanksLoader({
  dbLinks,
  firstName,
  lastName,
}: BanksLoaderProps) {
  // 🔄 AWAIT BLOQUEANTE #1: Obtener detalles de TODAS las cuentas (incluyendo ocultas)
  const rawAccounts = await getDetailedAccounts(dbLinks, true)

  // 🔄 AWAIT BLOQUEANTE #2: Para cada cuenta, obtener movimientos y calcular totalSpent
  const accountsWithSpent = await Promise.all(
    rawAccounts.map(async (acc) => {
      let totalSpent = 0

      if (!acc.isHidden) {
        const movements = await getAccountMovements(acc.linkToken, acc.fintocAccountId)
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        const monthlyExpenses = movements.filter((mov: any) => {
          if (!mov.date) return false
          const movDate = new Date(mov.date)
          return (
            (mov.type === 'debit' || mov.amount < 0) &&
            movDate.getMonth() === currentMonth &&
            movDate.getFullYear() === currentYear
          )
        })

        totalSpent = monthlyExpenses.reduce(
          (sum: number, mov: any) => sum + Math.abs(mov.amount),
          0
        )
      }

      return {
        ...acc,
        spentThisMonth: totalSpent,
      }
    })
  )

  // 🧠 Separar cuentas corrientes de tarjetas de crédito
  const bankAccounts = accountsWithSpent.filter(a => a.type !== 'credit_card')
  const creditCards = accountsWithSpent.filter(a => a.type === 'credit_card')

  return (
    <div className="flex flex-col gap-10">
      {/* SECCIÓN 1: CUENTAS BANCARIAS */}
      {bankAccounts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-18 font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <Landmark className="size-5 text-[#9d6dc0]" /> Cuentas Corrientes y Vista
          </h2>
          <div className="flex flex-wrap gap-6 mt-4">
            {bankAccounts.map((account, index) => (
              <div
                key={account.fintocAccountId}
                className={`flex flex-col gap-3 transition-all duration-300 w-full sm:w-[320px] ${
                  account.isHidden ? 'opacity-60 grayscale-[0.5]' : ''
                }`}
              >
                <BankCard
                  account={account}
                  userName={`${firstName} ${lastName}`.trim()}
                  showBalance={!account.isHidden}
                  color={index % 2 === 0 ? 'blue' : 'purple'}
                />
                <AccountToggle
                  accountId={account.fintocAccountId}
                  isHidden={account.isHidden}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: TARJETAS DE CRÉDITO */}
      {creditCards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-18 font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <CreditCard className="size-5 text-fuchsia-500" /> Tarjetas de Crédito
          </h2>
          <div className="flex flex-wrap gap-6 mt-4">
            {creditCards.map((account, index) => (
              <div
                key={account.fintocAccountId}
                className={`flex flex-col gap-3 transition-all duration-300 w-full sm:w-[320px] ${
                  account.isHidden ? 'opacity-60 grayscale-[0.5]' : ''
                }`}
              >
                <BankCard
                  account={account}
                  userName={`${firstName} ${lastName}`.trim()}
                  showBalance={!account.isHidden}
                  color="purple"
                />
                <AccountToggle
                  accountId={account.fintocAccountId}
                  isHidden={account.isHidden}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
