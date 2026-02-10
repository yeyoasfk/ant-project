import HeaderBox from '@/components/HeaderBox';
import AntExpenseChart from '@/components/AntExpenseChart';
import { getAntExpenses } from '@/lib/actions/bank.actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const Home = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Si no hay usuario, mandamos al login
  if (!user) redirect('/sign-in');

  // 1. Buscamos si el usuario ya vinculó una cuenta en nuestra DB
  const { data: account } = await supabase
    .from('bank_accounts')
    .select('fintoc_id')
    .eq('user_id', user.id)
    .single();

  let expenses = [];
  
  // 2. Si tiene cuenta, traemos los gastos hormiga desde la API de Fintoc
  if (account?.fintoc_id) {
    expenses = await getAntExpenses(account.fintoc_id);
  }

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Bienvenido"
            user={user.user_metadata.first_name || 'Usuario'}
            subtext="Mira cómo se distribuyen tus gastos hormiga este mes."
          />
        </header>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* AQUÍ SE RENDERIZA EL GRÁFICO 📊 */}
          {expenses.length > 0 ? (
            <AntExpenseChart data={expenses} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-4">Aún no hay datos para mostrar.</p>
              <a 
                href="/connect-bank" 
                className="rounded-lg bg-bank-gradient px-4 py-2 text-white font-semibold"
              >
                Vincular mi Banco 🏦
              </a>
            </div>
          )}

          {/* Espacio para una futura lista de transacciones o sugerencias */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Resumen de Ahorro</h3>
            <p className="mt-2 text-sm text-gray-600">
              Si reduces tus gastos en la categoría mayoritaria un 15%, podrías ahorrar 
              <span className="font-bold text-green-600"> ${ (expenses.reduce((a: number, b: any) => a + Math.abs(b.amount), 0) * 0.15).toLocaleString('es-CL') }</span> este mes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;