/**
 * Server Component:TransactionsLoader
 * 
 * Este componente es responsable de la lógica BLOQUEANTE de obtener movimientos.
 * Se renderiza dentro de un <Suspense> en la página principal,
 * permitiendo que el resto de la UI se muestre al instante.
 * 
 * Props: recibe los parámetros necesarios para evitar props drilling excesivo
 */

import TransactionsTable from './TransactionsTable'
import SyncButton from './SyncButton'
import { getAccountMovements } from '@/lib/actions/bank.actions'

interface TransactionsLoaderProps {
  currentAccount: {
    linkToken: string
    fintocAccountId: string
  }
  categories: any[]
}

export default async function TransactionsLoader({
  currentAccount,
  categories,
}: TransactionsLoaderProps) {
  // 🔄 Este await es lo que causa la latencia - pero ahora solo afecta este componente
  // El resto de la UI ya será visible al usuario mientras se ejecuta esto
  const rawTransactions = await getAccountMovements(
    currentAccount.linkToken,
    currentAccount.fintocAccountId
  )

  // 🧠 Mapeamos con los datos inteligentes para la tabla
  const filteredTransactions = rawTransactions.map((t: any) => ({
    id: t.id,
    db_id: t.db_id,
    accountId: currentAccount.fintocAccountId,
    name: t.description,
    amount: Math.abs(t.amount),
    date: t.date,
    categoryId: t.categoryId,
    categoryName: t.categoryName,
    categoryColor: t.categoryColor,
    isAnt: t.antCategory === 'Gasto Hormiga',
    type: t.type,
  }))

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1f1019]/60 backdrop-blur-xl p-4 shadow-2xl">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <h2 className="text-18 font-bold text-white">Movimientos de la cuenta</h2>

        {/* BOTÓN DE ACTUALIZACIÓN MANUAL (INTENT GRATUITO) */}
        {currentAccount && <SyncButton linkToken={currentAccount.linkToken} />}
      </div>

      {filteredTransactions.length > 0 ? (
        <TransactionsTable 
          transactions={filteredTransactions} 
          categories={categories || []} 
        />
      ) : (
        <div className="py-10 text-center text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
          No hay movimientos recientes en esta cuenta.
        </div>
      )}
    </div>
  )
}
