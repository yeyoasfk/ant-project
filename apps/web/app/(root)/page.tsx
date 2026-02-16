import HeaderBox from '@/components/HeaderBox';
import AntExpenseChart from '@/components/AntExpenseChart';
import { getAntExpenses } from '@/lib/actions/bank.actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RightSidebar from '@/components/RightSidebar';
import { formatAmount } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const Home = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/sign-in');

  // 1. OBTENER CUENTAS (Desde Supabase)
  const { data: rawAccounts } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 2. PREPARAR CUENTAS (Evitar $NaN)
  const accounts = rawAccounts?.map((acc) => ({
    ...acc,
    currentBalance: acc.currentBalance || 0, 
    mask: acc.mask || '****', 
    officialName: acc.institution_name || 'Banco'
  })) || [];

  // 3. OBTENER GASTOS DE TODAS LAS CUENTAS (CORRECCIÓN CRÍTICA)
  let rawExpenses: any[] = [];
  
  if (accounts.length > 0) {
    try {
      // Ejecutamos la búsqueda en paralelo para todas las cuentas vinculadas
      const expensesPromises = accounts.map((account) => 
        getAntExpenses(account.fintoc_id)
      );
      
      const results = await Promise.all(expensesPromises);
      
      // "Aplanamos" los resultados: convertimos varios arrays en una sola lista gigante
      rawExpenses = results.flat();
      
    } catch (error) {
      console.error("Error obteniendo gastos en Home:", error);
    }
  }

  // 4. SANITIZAR Y ORDENAR GASTOS
  const sanitizedExpenses = rawExpenses.map((e: any) => ({
    ...e,
    amount: Number(e.amount) || 0,
    date: e.date ? new Date(e.date) : new Date(),
    description: e.description || 'Sin descripción'
  })).sort((a, b) => b.date.getTime() - a.date.getTime()); // Ordenar por fecha desc

  // 5. FILTRO: Transacciones de las últimas 24 horas (Para la lista de "Hoy")
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  
  const dailyTransactions = sanitizedExpenses.filter((t: any) => {
    const tDate = new Date(t.date);
    return tDate > oneDayAgo;
  });

  // 6. DATOS DE USUARIO
  const loggedInUser = {
    firstName: user.user_metadata?.first_name || 'Diego',
    lastName: user.user_metadata?.last_name || 'Albornoz',
    email: user.email
  };

  // Cálculo del ahorro total estimado (15% de todos los gastos históricos)
  const totalSavings = sanitizedExpenses.reduce((acc, curr) => acc + Math.abs(curr.amount), 0) * 0.15;

  return (
    <section className="home no-scrollbar flex w-full flex-row max-xl:flex-col overflow-hidden">
      
      {/* --- COLUMNA IZQUIERDA --- */}
      <div className="no-scrollbar flex w-full flex-1 flex-col gap-8 px-5 py-7 lg:px-8 xl:overflow-y-auto">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Bienvenido"
            user={loggedInUser.firstName}
            subtext="Analiza tus gastos hormiga y descubre cuánto podrías ahorrar."
          />
        </header>

        {/* FILA SUPERIOR: GRÁFICO Y RESUMEN */}
        <div className="flex flex-col gap-6 xl:flex-row w-full">
          
          {/* Gráfico (Muestra historial completo) */}
          <div className="flex-1 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm min-h-[300px]">
            {sanitizedExpenses.length > 0 ? (
              <AntExpenseChart data={sanitizedExpenses} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-gray-400">
                <p>No se encontraron gastos recientes.</p>
                {accounts.length === 0 && (
                  <Link href="/connect-bank" className="text-sm font-semibold text-blue-600 hover:underline">
                    Vincula tu banco para comenzar
                  </Link>
                )}
              </div>
            )}
          </div>
          
          {/* Tarjeta de Ahorro */}
          <div className="flex w-full flex-col justify-center rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm xl:w-[300px]">
            <div className="flex flex-col gap-2">
              <h3 className="text-16 font-semibold text-gray-600">Ahorro Estimado (15%)</h3>
              <p className="text-14 text-gray-500">Basado en tus gastos hormiga totales</p>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <p className="text-30 font-bold text-green-600">
                {formatAmount(totalSavings)}
              </p>
            </div>
            <div className="mt-6">
              <p className="text-12 text-gray-400 italic">
                "Pequeños gastos hacen grandes agujeros."
              </p>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR: TRANSACCIONES DE HOY */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-18 font-bold text-gray-900">Transacciones de Hoy</h2>
            <Link 
              href="/transaction-history" 
              className="text-14 font-semibold text-blue-600 hover:underline"
            >
              Ver todas ({sanitizedExpenses.length})
            </Link>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[100px]">
            {dailyTransactions.length > 0 ? (
              dailyTransactions.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold uppercase">
                      {t.description ? t.description[0] : '?'}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-14 font-semibold text-gray-900">{t.description}</h3>
                      <p className="text-12 text-gray-500">{t.antCategory}</p>
                    </div>
                  </div>
                  <p className={`text-14 font-semibold ${t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatAmount(t.amount)}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <p>No hay movimientos en las últimas 24 hrs 🍃</p>
                {/* Ayuda visual: Si hay gastos históricos pero no hoy */}
                {sanitizedExpenses.length > 0 && (
                  <p className="text-xs text-blue-500 mt-2">
                    (Pero tienes {sanitizedExpenses.length} gastos antiguos en el historial)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA --- */}
      <RightSidebar 
        user={loggedInUser}
        transactions={sanitizedExpenses} // Pasamos TODO el historial, no solo lo de hoy
        banks={accounts.slice(0, 2)} 
      />
    </section>
  );
};

export default Home;