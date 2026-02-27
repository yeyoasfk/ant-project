import HeaderBox from '@/components/HeaderBox'
import CategoryDashboard from '@/components/CategoryDashboard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PresupuestosPage = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  // 1. Obtenemos todas tus categorías
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id);

  // 2. 🧠 OBTENEMOS LOS GASTOS DE ESTE MES
  // Calculamos el primer día del mes actual para no sumar gastos viejos a tu presupuesto actual
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, category_id, type, date')
    .eq('user_id', user.id)
    .eq('type', 'debit') // Solo sumamos las salidas de dinero (gastos)
    .gte('date', firstDayOfMonth); // Desde el día 1 de este mes

  // 3. 🧮 EL MATEMÁTICO: Sumamos los gastos por cada categoría
  const categoriesWithSpent = (categories || []).map(cat => {
    // Filtramos los movimientos que pertenecen a esta categoría
    const catTransactions = (transactions || []).filter(t => t.category_id === cat.id);
    
    // Sumamos los montos (usamos Math.abs para asegurar que sean números positivos)
    const totalSpent = catTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    return {
      ...cat,
      spent: totalSpent // 👈 Aquí inyectamos la suma real
    };
  });

  return (
    <div className="flex flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
      <HeaderBox 
        title="Mis Presupuestos" 
        subtext="Controla tus límites de gastos por categoría este mes." 
      />

      <div className="w-full">
        {/* 👈 LE PASAMOS LAS TRANSACCIONES REALES */}
        <CategoryDashboard 
          initialCategories={categoriesWithSpent} 
          transactions={transactions || []} 
        />
      </div>
    </div>
  )
}

export default PresupuestosPage