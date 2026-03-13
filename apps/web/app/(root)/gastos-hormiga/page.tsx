 import { Suspense } from 'react'
import HeaderBox from '@/components/HeaderBox';
import AnalysisLoader from '@/components/AnalysisLoader'
import AnalysisSkeleton from '@/components/AnalysisSkeleton'
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
      <section className="flex w-full flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
        <HeaderBox title="Análisis y Gráficos" subtext="Vincula una cuenta para ver tu análisis financiero." />
      </section>
    );
  }

  // ✅ SOLO LÓGICA INSTANTÁNEA
  // TODO LO BLOQUEANTE se movió a AnalysisLoader

  return (
    <section className="flex w-full flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
      {/* ✅ HEADER SE MUESTRA AL INSTANTE */}
      <div className="flex flex-col gap-2">
        <HeaderBox
          title="Análisis y Gráficos"
          subtext="Revisa tus ingresos, egresos y el balance de tus gastos hormiga en detalle."
        />
      </div>

      {/* 
        🔄 SUSPENSE: ANÁLISIS CARGARÁ MIENTRAS SE MUESTRA SKELETON CIRCULAR
        El AnalysisLoader hace todos los awaits bloqueantes:
        - getDetailedAccounts()
        - getAccountMovements()
        - Promise.all(getAntExpenses)
      */}
      <Suspense fallback={<AnalysisSkeleton />}>
        <AnalysisLoader
          dbLinks={dbLinks}
          urlAccountId={urlAccountId}
        />
      </Suspense>
    </section>
  );
};


export default AnalisisPage; 