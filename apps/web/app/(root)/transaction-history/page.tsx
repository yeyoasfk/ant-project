import { Suspense } from 'react'
import HeaderBox from '@/components/HeaderBox'
import BankDropdown from '@/components/BankDropdown'
import TransactionsLoader from '@/components/TransactionsLoader'
import TransactionTableSkeleton from '@/components/TransactionTableSkeleton'
import TransactionHistoryClient from '@/components/TransactionHistoryClient'
import { createClient } from '@/lib/supabase/server'
import { getDetailedAccounts } from '@/lib/actions/bank.actions'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SearchParamProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const TransactionHistory = async ({ searchParams }: SearchParamProps) => {
  const params = await searchParams
  const urlAccountId = params?.id as string

  // 1. Verificamos usuario (instantáneo)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  // 2. Obtenemos los links (instituciones) vinculadas desde Supabase (instantáneo)
  const { data: dbLinks } = await supabase.from('bank_accounts').select('*').eq('user_id', user.id)

  if (!dbLinks || dbLinks.length === 0) {
    return (
      <div className="flex flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
        <HeaderBox title="Historial de Transacciones" subtext="No tienes cuentas vinculadas aún." />
      </div>
    )
  }

  // 3. Obtenemos el detalle real de todas las cuentas desde Fintoc
  // ⚠️ NOTA: Este await se puede optimizar después si también es bloqueante
  // Por ahora, lo dejamos porque es rápido (solo lista de cuentas, no 100 movimientos)
  const allAccounts = await getDetailedAccounts(dbLinks)

  // 4. Determinamos qué cuenta está seleccionada (la de la URL o la primera por defecto)
  const currentAccount = urlAccountId
    ? allAccounts.find(a => a.fintocAccountId === urlAccountId) || allAccounts[0]
    : allAccounts[0]

  // 5. Obtenemos las categorías del usuario (instantáneo - es solo una consulta a DB)
  const { data: categories } = await supabase.from('categories').select('*').eq('user_id', user.id)

  return (
    <div className="flex flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
      {/* ✅ ESTE CONTENEDOR SE MUESTRA AL INSTANTE */}
      <HeaderBox
        title="Historial de Transacciones"
        subtext="Consulta tus ingresos y gastos por cuenta."
      />

      <div className="space-y-8">
        {/* ✅ DROPDOWN MOSTRADO AL INSTANTE */}
        {allAccounts.length > 0 && (
          <BankDropdown
            accounts={allAccounts}
            currentAccountId={currentAccount.fintocAccountId}
          />
        )}

        {/* 
          🔄 TRANSACTION HISTORY CLIENT WRAPPER
          Proporciona el Context para el modal de categorización
          El modal se renderiza al nivel más alto para evitar problemas de stacking
        */}
        <TransactionHistoryClient categories={categories || []}>
          <Suspense fallback={<TransactionTableSkeleton />}>
            <TransactionsLoader
              currentAccount={{
                linkToken: currentAccount.linkToken,
                fintocAccountId: currentAccount.fintocAccountId,
              }}
              categories={categories || []}
            />
          </Suspense>
        </TransactionHistoryClient>
      </div>
    </div>
  )
}

export default TransactionHistory