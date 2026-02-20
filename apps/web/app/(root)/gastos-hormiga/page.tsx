import HeaderBox from '@/components/HeaderBox';
import AntExpenseSummary from '@/components/AntExpenseSummary';
import IncomeExpenseChart from '@/components/IncomeExpenseChart';
import MiniBankDropdown from '@/components/MiniBankDropdown'; // 👈 El nuevo selector
import { getAntExpenses, getDetailedAccounts, getAccountMovements } from '@/lib/actions/bank.actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const AnalisisPage = async ({ searchParams }: { searchParams: Promise<{ id?: string }> }) => {
  const params = await searchParams;
  const urlAccountId = params?.id as string;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  const { data: dbLinks } = await supabase.from('bank_accounts').select('*').eq('user_id', user.id);

  if (!dbLinks || dbLinks.length === 0) {
    return (
      <section className="flex w-full flex-col gap-8 bg-gray-50 px-5 py-7 lg:py-12 min-h-screen">
        <HeaderBox title="Análisis y Gráficos" subtext="Vincula una cuenta para ver tu análisis financiero." />
      </section>
    );
  }

  // 1. OBTENER DETALLES GLOBALES
  const allAccounts = await getDetailedAccounts(dbLinks);
  const totalCurrentBalance = allAccounts.reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

  // 2. 🎯 IDENTIFICAR LA CUENTA SELECCIONADA POR EL DROPDOWN
  const currentAccount = urlAccountId ? allAccounts.find(a => a.fintocAccountId === urlAccountId) || allAccounts[0] : allAccounts[0];

  // 3. 🧠 OBTENER MOVIMIENTOS ESPECÍFICOS DEL BANCO SELECCIONADO (Para el gráfico)
  let currentAccountTransactions: any[] = [];
  if (currentAccount) {
    const rawAccountMoves = await getAccountMovements(currentAccount.linkToken, currentAccount.fintocAccountId);
    currentAccountTransactions = rawAccountMoves.map((t: any) => ({
      ...t, 
      // Mantenemos el monto original para que el gráfico sepa si es ingreso (+) o egreso (-)
      amount: typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0
    }));
  }

  // 4. OBTENER GASTOS HORMIGA GLOBALES (Para el Banner Superior)
  let rawGlobalExpenses: any[] = [];
  const accountsWithFintocId = dbLinks.filter(acc => acc.fintoc_id);
  if (accountsWithFintocId.length > 0) {
    try {
      const expensesPromises = accountsWithFintocId.map(account => getAntExpenses(account.fintoc_id));
      const results = await Promise.all(expensesPromises);
      rawGlobalExpenses = results.flat();
    } catch (error) {
      console.error("❌ Error obteniendo gastos globales:", error);
    }
  }

  // Sanitizar y calcular gastos hormiga del mes (Banner Superior)
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyAntExpenses = rawGlobalExpenses
    .map((e: any) => ({ ...e, date: e.date ? new Date(e.date) : new Date() }))
    .filter((e: any) => e.date >= firstDayOfMonth && (e.type === 'debit' || e.amount < 0))
    .reduce((acc: number, curr: any) => acc + Math.abs(curr.amount), 0);

  return (
    <section className="flex w-full flex-col gap-8 bg-gray-50 px-5 py-7 lg:py-12 min-h-screen">
      <div className="flex flex-col gap-2">
        <HeaderBox 
          title="Análisis y Gráficos" 
          subtext="Revisa tus ingresos, egresos y el balance de tus gastos hormiga en detalle." 
        />
      </div>

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
    </section>
  );
};

export default AnalisisPage;