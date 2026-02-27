import HeaderBox from '@/components/HeaderBox'
import CategoryDashboard from '@/components/CategoryDashboard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 👈 1. AÑADIMOS searchParams PARA LEER LA URL
const PresupuestosPage = async ({ searchParams }: { searchParams: Promise<{ categoryId?: string }> }) => {
  const params = await searchParams;
  const targetCategoryId = params?.categoryId as string;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  // 1. Obtenemos todas tus categorías
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id);

  // 2. 🧠 OBTENEMOS LOS GASTOS DE ESTE MES
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
    const catTransactions = (transactions || []).filter(t => t.category_id === cat.id);
    const totalSpent = catTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    return {
      ...cat,
      spent: totalSpent 
    };
  });

  return (
    <div className="flex flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
      <HeaderBox 
        title="Mis Presupuestos" 
        subtext="Controla tus límites de gastos por categoría este mes." 
      />

      <div className="w-full">
        {/* 👈 2. LE PASAMOS EL ID AL DASHBOARD */}
        <CategoryDashboard 
          initialCategories={categoriesWithSpent} 
          transactions={transactions || []} 
          targetCategoryId={targetCategoryId} 
        />
      </div>
    </div>
  )
}

export default PresupuestosPage