import HeaderBox from '@/components/HeaderBox'
import TransactionsTable from '@/components/TransactionsTable'
import BankDropdown from '@/components/BankDropdown' // 👈 Importamos el nuevo componente
import { createClient } from '@/lib/supabase/server'
import { getDetailedAccounts, getAccountMovements } from '@/lib/actions/bank.actions' // 👈 Importamos las nuevas funciones
import { redirect } from 'next/navigation'

interface SearchParamProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const TransactionHistory = async ({ searchParams }: SearchParamProps) => {
  const params = await searchParams;
  const urlAccountId = (params.id as string);

  // 1. Verificamos usuario
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  // 2. Obtenemos los links (instituciones) vinculadas desde Supabase
  const { data: dbLinks } = await supabase.from('bank_accounts').select('*').eq('user_id', user.id);

  if (!dbLinks || dbLinks.length === 0) {
    return (
      <div className="flex flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
        <HeaderBox title="Historial de Transacciones" subtext="No tienes cuentas vinculadas aún." />
      </div>
    );
  }

  // 3. Obtenemos el detalle real de todas las cuentas desde Fintoc
  const allAccounts = await getDetailedAccounts(dbLinks);

  // 4. Determinamos qué cuenta está seleccionada (la de la URL o la primera por defecto)
  const currentAccount = urlAccountId
    ? allAccounts.find(a => a.fintocAccountId === urlAccountId) || allAccounts[0]
    : allAccounts[0];

  // 5. Obtenemos los movimientos SOLO de la cuenta seleccionada
  let filteredTransactions: any[] = [];
  if (currentAccount) {
    const rawTransactions = await getAccountMovements(currentAccount.linkToken, currentAccount.fintocAccountId);

    // Mapeamos para la tabla
    filteredTransactions = rawTransactions.map((t: any) => ({
      id: t.id,
      accountId: currentAccount.fintocAccountId,
      name: t.description,
      amount: Math.abs(t.amount),
      date: t.date,
      category: t.antCategory,
      type: t.type
    }));
  }

  return (
    <div className="flex flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
      <HeaderBox
        title="Historial de Transacciones"
        subtext="Consulta tus ingresos y gastos por cuenta."
      />

      <div className="space-y-8">
        {/* BANNER DESPLEGABLE DINÁMICO */}
        {allAccounts.length > 0 && (
          <BankDropdown
            accounts={allAccounts}
            currentAccountId={currentAccount.fintocAccountId}
          />
        )}

        {/* TABLA DE TRANSACCIONES */}
        <div className="rounded-2xl border border-white/10 bg-[#1f1019]/60 backdrop-blur-xl p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between px-2">
            <h2 className="text-18 font-bold text-white">Movimientos de la cuenta</h2>
          </div>

          {filteredTransactions.length > 0 ? (
            <TransactionsTable transactions={filteredTransactions} />
          ) : (
            <div className="py-10 text-center text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
              No hay movimientos recientes en esta cuenta.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionHistory