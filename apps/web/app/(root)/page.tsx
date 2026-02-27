import HeaderBox from '@/components/HeaderBox';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import RecentTransactions from '@/components/RecentTransactions';
import AntExpenseSummary from '@/components/AntExpenseSummary'; // 👈 Importamos el nuevo componente
import { getAntExpenses, getDetailedAccounts, getAccountMovements } from '@/lib/actions/bank.actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RightSidebar from '@/components/RightSidebar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Home = async ({ searchParams }: { searchParams: Promise<{ id?: string }> }) => {
  const params = await searchParams;
  const urlAccountId = params?.id as string;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  const loggedInUser = {
    firstName: user.user_metadata?.first_name || 'Diego',
    lastName: user.user_metadata?.last_name || 'Albornoz',
    email: user.email
  };

  // 1. OBTENER LINKS DESDE SUPABASE
  const { data: dbLinks } = await supabase.from('bank_accounts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

  if (!dbLinks || dbLinks.length === 0) {
    return (
      <section className="flex w-full flex-col overflow-hidden">
        <div className="flex w-full flex-1 flex-col gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          <HeaderBox type="greeting" title="Bienvenido," user={loggedInUser.firstName} subtext="Vincula una cuenta para comenzar a analizar tus gastos." />
          <TotalBalanceBox accounts={[]} totalBanks={0} totalCurrentBalance={0} />
        </div>
      </section>
    );
  }

  // 2. OBTENER DETALLES REALES
  const allAccounts = await getDetailedAccounts(dbLinks);
  const totalBanks = allAccounts.length;
  const totalCurrentBalance = allAccounts.reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

  // 3. CUENTA SELECCIONADA PARA PESTAÑAS
  const currentAccount = urlAccountId ? allAccounts.find(a => a.fintocAccountId === urlAccountId) || allAccounts[0] : allAccounts[0];

  // 4. MOVIMIENTOS DE LA CUENTA SELECCIONADA
  let currentAccountTransactions: any[] = [];
  if (currentAccount) {
    const rawAccountMoves = await getAccountMovements(currentAccount.linkToken, currentAccount.fintocAccountId);
    currentAccountTransactions = rawAccountMoves.map((t: any) => ({
      ...t, amount: Math.abs(t.amount)
    }));
  }

  // 5. OBTENER GASTOS GLOBALES
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

  const sanitizedGlobalExpenses = rawGlobalExpenses
    .map((e: any) => ({
      ...e,
      amount: typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0,
      date: e.date ? new Date(e.date) : new Date(),
    }))
    .filter((e: any) => e.id && !isNaN(e.amount))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // 🧠 NUEVO CÁLCULO CIENTÍFICO: Gastos Hormiga Reales del Mes Actual
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyAntExpenses = sanitizedGlobalExpenses
    .filter((e: any) => {
      const isThisMonth = e.date >= firstDayOfMonth;
      const isExpense = e.type === 'debit' || e.amount < 0;
      const isActuallyAnt = e.antCategory === "Gasto Hormiga"; // 🐜 AQUÍ ESTÁ LA MAGIA
      
      return isThisMonth && isExpense && isActuallyAnt;
    })
    .reduce((acc: number, curr: any) => acc + Math.abs(curr.amount), 0);
  
  const { data: categories } = await supabase.from('categories').select('*').eq('user_id', user.id);
    
  return (
    <section className="flex w-full flex-col lg:flex-row overflow-hidden">
      <div className="flex w-full flex-1 flex-col gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 py-6 sm:py-8 overflow-y-auto">
        <header className="home-header">
          <HeaderBox type="greeting" title="Bienvenido," user={loggedInUser.firstName} subtext="Analiza tus gastos hormiga y mantén el control de tus finanzas." />
        </header>

        {/* BANNER PRINCIPAL */}
        <TotalBalanceBox accounts={allAccounts} totalBanks={totalBanks} totalCurrentBalance={totalCurrentBalance} />

        {/* 🆕 NUEVO BANNER DE GASTOS HORMIGA */}
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
          categories={categories || []} // 👈 ¡Nuevo dato inyectado!
        />
      </div>
    </section>
  );
};

export default Home;