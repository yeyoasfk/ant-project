import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox';
import { createClient } from '@/lib/supabase/server';
import { getDetailedAccounts, getAccountMovements } from '@/lib/actions/bank.actions';
import { redirect } from 'next/navigation';

const MyBanks = async () => {
  // 1. Verificamos usuario
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  // Obtenemos los nombres del usuario (si los guardaste en el metadata, sino usamos el email o un genérico)
  const firstName = user.user_metadata?.first_name || 'Usuario';
  const lastName = user.user_metadata?.last_name || '';

  // 2. Obtenemos los links (instituciones) vinculadas desde Supabase
  const { data: dbLinks } = await supabase.from('bank_accounts').select('*').eq('user_id', user.id);

  if (!dbLinks || dbLinks.length === 0) {
    return (
      <section className="flex w-full flex-col gap-8 bg-gray-50 px-5 py-7 lg:py-12 min-h-screen">
        <HeaderBox 
          title="Mis Cuentas Bancarias"
          subtext="No tienes cuentas vinculadas aún. Ve al Inicio para vincular una."
        />
      </section>
    );
  }

  // 3. Obtenemos el detalle real de todas las cuentas desde Fintoc
  const rawAccounts = await getDetailedAccounts(dbLinks);

  // 4. Mapeamos las cuentas para inyectarles el total gastado en el mes
  // Usamos Promise.all porque getAccountMovements es asíncrona
  const accountsWithSpent = await Promise.all(
    rawAccounts.map(async (acc) => {
      // Obtenemos todos los movimientos de esta cuenta específica
      const movements = await getAccountMovements(acc.linkToken, acc.fintocAccountId);
      
      // Filtramos solo los GASTOS (débitos) del MES ACTUAL
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyExpenses = movements.filter((mov: any) => {
        const movDate = new Date(mov.date);
        return (
          mov.type === 'debit' && // Solo salidas de dinero
          movDate.getMonth() === currentMonth &&
          movDate.getFullYear() === currentYear
        );
      });

      // Sumamos el valor total gastado
      const totalSpent = monthlyExpenses.reduce((sum: number, mov: any) => sum + Math.abs(mov.amount), 0);

      return {
        ...acc, // Mantenemos el nombre, balance, máscara, etc.
        spentThisMonth: totalSpent
      };
    })
  );

  return (
    <section className="flex w-full flex-col gap-8 bg-gray-50 px-5 py-7 lg:py-12 min-h-screen">
      <div className="flex flex-col gap-2">
        <HeaderBox 
          title="Mis Cuentas Bancarias"
          subtext="Gestiona tus actividades bancarias y monitorea tu gasto mensual."
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-18 font-bold text-gray-900">Tus Tarjetas Activas</h2>
        
        <div className="flex flex-wrap gap-6">
          {accountsWithSpent.map((account, index) => (
            <div key={account.fintocAccountId} className="flex flex-col gap-2">
                <BankCard 
                  account={account}
                  userName={`${firstName} ${lastName}`.trim()}
                  showBalance={true}
                  color={index % 2 === 0 ? 'blue' : 'purple'} 
                />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MyBanks