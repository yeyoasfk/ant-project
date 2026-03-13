import { Suspense } from 'react'
import HeaderBox from '@/components/HeaderBox';
import DashboardLoader from '@/components/DashboardLoader'
import DashboardSkeleton from '@/components/DashboardSkeleton'
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
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
    email: user.email || 'user@example.com'
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

  // ✅ SOLO LÓGICA INSTANTÁNEA: Verificar usuario y dbLinks
  // TODO LO BLOQUEANTE se movió a DashboardLoader
  
  return (
    <section className="flex w-full flex-col lg:flex-row overflow-hidden">
      {/* ✅ HEADER SE MUESTRA AL INSTANTE */}
      <header className="home-header px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <HeaderBox
          type="greeting"
          title="Bienvenido,"
          user={loggedInUser.firstName}
          subtext="Analiza tus gastos hormiga y mantén el control de tus finanzas."
        />
      </header>

      {/* 
        🔄 SUSPENSE: DASHBOARD CARGARÁ MIENTRAS SE MUESTRA SKELETON
        El DashboardLoader hace todos los awaits bloqueantes:
        - getDetailedAccounts()
        - getAccountMovements()
        - Promise.all(getAntExpenses)
      */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardLoader
          dbLinks={dbLinks}
          loggedInUser={loggedInUser}
          urlAccountId={urlAccountId}
        />
      </Suspense>
    </section>
  );
};

export default Home;