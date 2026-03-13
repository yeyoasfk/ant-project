import { Suspense } from 'react'
import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox';
import BanksLoader from '@/components/BanksLoader'
import BankCardsSkeleton from '@/components/BankCardsSkeleton'
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const MyBanks = async () => {
  // 1. Verificamos usuario
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const firstName = user.user_metadata?.first_name || 'Usuario';
  const lastName = user.user_metadata?.last_name || '';

  // 2. Obtenemos los links (instituciones) vinculadas desde Supabase
  const { data: dbLinks } = await supabase.from('bank_accounts').select('*').eq('user_id', user.id);

  if (!dbLinks || dbLinks.length === 0) {
    return (
      <section className="flex w-full flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
        <HeaderBox
          title="Mis Cuentas Bancarias"
          subtext="No tienes cuentas vinculadas aún. Ve al Inicio para vincular una."
        />
      </section>
    );
  }

  // ✅ SOLO LÓGICA INSTANTÁNEA: Verificar usuario
  // TODO LO BLOQUEANTE se movió a BanksLoader

  return (
    <section className="flex w-full flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
      {/* ✅ HEADER SE MUESTRA AL INSTANTE */}
      <div className="flex flex-col gap-2">
        <HeaderBox
          title="Gestión de Cuentas"
          subtext="Administra qué cuentas y tarjetas quieres monitorear en tu panel."
        />
      </div>

      {/* 
        🔄 SUSPENSE: LISTA DE TARJETAS CARGARÁ MIENTRAS SE MUESTRA SKELETON
        El BanksLoader hace todos los awaits bloqueantes:
        - getDetailedAccounts(dbLinks, true)
        - Promise.all(getAccountMovements) para cada cuenta
      */}
      <Suspense fallback={<BankCardsSkeleton />}>
        <BanksLoader
          dbLinks={dbLinks}
          firstName={firstName}
          lastName={lastName}
        />
      </Suspense>
    </section>
  );
}

export default MyBanks