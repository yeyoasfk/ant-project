import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox';
import AccountToggle from '@/components/AccountToggle'; // 👈 El nuevo interruptor
import { createClient } from '@/lib/supabase/server';
import { getDetailedAccounts, getAccountMovements } from '@/lib/actions/bank.actions';
import { redirect } from 'next/navigation';
import { CreditCard, Landmark } from 'lucide-react';

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

// 3. Obtenemos el detalle real de TODAS las cuentas (incluyendo las ocultas = true)
  const rawAccounts = await getDetailedAccounts(dbLinks, true);

  // 4. Mapeamos las cuentas para inyectarles el total gastado
  const accountsWithSpent = await Promise.all(
    rawAccounts.map(async (acc) => {
      // Si la cuenta está oculta, evitamos hacer fetch a sus movimientos para que cargue más rápido
      let totalSpent = 0;
      
      if (!acc.isHidden) {
        const movements = await getAccountMovements(acc.linkToken, acc.fintocAccountId);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyExpenses = movements.filter((mov: any) => {
          if (!mov.date) return false;
          const movDate = new Date(mov.date);
          return (
            (mov.type === 'debit' || mov.amount < 0) &&
            movDate.getMonth() === currentMonth &&
            movDate.getFullYear() === currentYear
          );
        });

        totalSpent = monthlyExpenses.reduce((sum: number, mov: any) => sum + Math.abs(mov.amount), 0);
      }

      return {
        ...acc,
        spentThisMonth: totalSpent
      };
    })
  );

  // 🧠 5. SEPARAMOS CUENTAS CORRIENTES/VISTA DE TARJETAS DE CRÉDITO
  const bankAccounts = accountsWithSpent.filter(a => a.type !== 'credit_card');
  const creditCards = accountsWithSpent.filter(a => a.type === 'credit_card');

  return (
    <section className="flex w-full flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
      <div className="flex flex-col gap-2">
        <HeaderBox
          title="Gestión de Cuentas"
          subtext="Administra qué cuentas y tarjetas quieres monitorear en tu panel."
        />
      </div>

      <div className="flex flex-col gap-10">
        
        {/* SECCIÓN 1: CUENTAS BANCARIAS */}
        {bankAccounts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-18 font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Landmark className="size-5 text-[#9d6dc0]" /> Cuentas Corrientes y Vista
            </h2>
            <div className="flex flex-wrap gap-6 mt-4">
              {bankAccounts.map((account, index) => (
                <div 
                  key={account.fintocAccountId} 
                  className={`flex flex-col gap-3 transition-all duration-300 w-full sm:w-[320px] ${account.isHidden ? 'opacity-60 grayscale-[0.5]' : ''}`}
                >
                  <BankCard
                    account={account}
                    userName={`${firstName} ${lastName}`.trim()}
                    showBalance={!account.isHidden}
                    color={index % 2 === 0 ? 'blue' : 'purple'}
                  />
                  {/* El botón mágico */}
                  <AccountToggle accountId={account.fintocAccountId} isHidden={account.isHidden} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN 2: TARJETAS DE CRÉDITO */}
        {creditCards.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-18 font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <CreditCard className="size-5 text-fuchsia-500" /> Tarjetas de Crédito
            </h2>
            <div className="flex flex-wrap gap-6 mt-4">
              {creditCards.map((account, index) => (
                <div 
                  key={account.fintocAccountId} 
                  className={`flex flex-col gap-3 transition-all duration-300 w-full sm:w-[320px] ${account.isHidden ? 'opacity-60 grayscale-[0.5]' : ''}`}
                >
                  <BankCard
                    account={account}
                    userName={`${firstName} ${lastName}`.trim()}
                    showBalance={!account.isHidden}
                    color="purple" 
                  />
                  {/* El botón mágico */}
                  <AccountToggle accountId={account.fintocAccountId} isHidden={account.isHidden} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}

export default MyBanks