import HeaderBox from '@/components/HeaderBox';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import RecentTransactions from '@/components/RecentTransactions';
import AntExpenseSummary from '@/components/AntExpenseSummary'; // 👈 Importamos el nuevo componente
import { getAntExpenses, getDetailedAccounts, getAccountMovements } from '@/lib/actions/bank.actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RightSidebar from '@/components/RightSidebar';
import Link from 'next/link';

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
      <section className="flex w-full flex-col overflow-hidden min-h-screen">
        <div className="flex w-full flex-1 flex-col gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          <HeaderBox 
            type="greeting" 
            title="Bienvenido," 
            user={loggedInUser.firstName} 
            subtext="Para comenzar a analizar tus gastos, necesitas vincular al menos una cuenta." 
          />
          
          {/* 🚀 PANTALLA DE BIENVENIDA / BOTÓN GIGANTE FINTOC */}
          <div className="flex flex-col items-center justify-center mt-10 sm:mt-16 p-8 sm:p-12 bg-[#1f1019]/60 border border-dashed border-white/20 rounded-3xl text-center max-w-2xl mx-auto backdrop-blur-sm shadow-2xl">
            <div className="size-20 bg-gradient-to-tr from-[#572371] to-[#9d6dc0] rounded-full flex items-center justify-center mb-6 shadow-glow-purple">
              <span className="text-4xl">🏦</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Conecta tu primer Banco</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Para que la app pueda analizar tus gastos hormiga y armar tus presupuestos, necesitamos sincronizar tus movimientos. Conecta tu banco de forma 100% segura.
            </p>
            <Link 
              href="/connect-bank"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#653584] to-[#9333ea] hover:from-[#7a429e] hover:to-[#a855f7] text-white text-lg font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-105"
            >
              Conectar con Fintoc
            </Link>
          </div>
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
  // 🛡️ ESCUDO DE SEGURIDAD: Si no hay cuentas visibles (están todas ocultas o falló la carga)
  if (!currentAccount) {
    return (
      <section className="flex w-full flex-col overflow-hidden min-h-screen">
        <div className="flex w-full flex-1 flex-col gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          <HeaderBox type="greeting" title="Bienvenido," user={loggedInUser.firstName} subtext="Analiza tus gastos hormiga y mantén el control de tus finanzas." />
          
          <div className="flex flex-col items-center justify-center mt-10 p-8 sm:p-12 bg-[#1f1019]/60 border border-dashed border-white/20 rounded-3xl text-center max-w-2xl mx-auto backdrop-blur-sm shadow-2xl">
            <span className="text-5xl mb-4">👻</span>
            <h2 className="text-2xl font-bold text-white mb-3">No hay cuentas visibles</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Parece que tienes bancos vinculados, pero todas las cuentas están ocultas en tu panel de control, o Fintoc está procesando los datos.
            </p>
            <Link 
              href="/my-banks" 
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#653584] to-[#9333ea] hover:from-[#7a429e] hover:to-[#a855f7] text-white text-lg font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-105"
            >
              Gestionar Mis Bancos
            </Link>
          </div>
        </div>
      </section>
    );
  }

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