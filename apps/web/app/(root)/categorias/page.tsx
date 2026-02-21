import HeaderBox from '@/components/HeaderBox';
import CategoryDashboard from '@/components/CategoryDashboard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const CategoriasPage = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  const loggedInUser = {
    firstName: user.user_metadata?.first_name || 'Diego',
  };

  return (
    // NOTA: No importamos ni renderizamos RightSidebar aquí
    <section className="flex w-full flex-col gap-8 bg-[#110916] px-5 py-7 lg:px-10 lg:py-12 min-h-screen relative overflow-hidden">
      
      {/* Manchas de luz de fondo (Mesh Gradient simulado) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#3b174d]/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#653584]/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Contenido Principal */}
      <div className="relative z-10 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <HeaderBox 
            title="Mis Presupuestos" 
            subtext="Administra los límites de tus categorías y monitorea tus gastos para no pasarte." 
          />
        </header>

        {/* Componente Interactivo que acabamos de crear */}
        <CategoryDashboard />
      </div>
    </section>
  );
};

export default CategoriasPage;