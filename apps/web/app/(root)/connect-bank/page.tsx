import HeaderBox from '@/components/HeaderBox'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic' // 1. Importamos dynamic

// 2. Importamos el componente con SSR desactivado
const BankConnect = dynamic(() => import('@/components/BankConnect'), { 
  ssr: false,
  loading: () => (
    // Spinner opcional mientras carga el js del botón
    <div className="flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-400">
      Cargando botón...
    </div>
  )
})

const ConnectBank = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  const loggedIn = { 
    firstName: user.user_metadata.first_name || 'Usuario', 
    lastName: user.user_metadata.last_name || '', 
    email: user.email || '' 
  };

  return (
    <section className="no-scrollbar flex w-full flex-row max-xl:max-h-screen max-xl:overflow-y-scroll">
      <div className="no-scrollbar flex w-full flex-1 flex-col gap-8 px-5 sm:px-8 py-7 lg:py-12">
        
        <HeaderBox 
          type="greeting"
          title="Conecta tu Banco"
          subtext="Vincula tu cuenta principal para rastrear tus gastos hormiga."
          user={loggedIn.firstName}
        />

        <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                🛡️ Usamos Fintoc para leer tus movimientos de forma segura.
            </div>
            
            <div className="flex justify-start mt-4">
                {/* 3. Usamos el componente dinámico */}
                <BankConnect />
            </div>
        </div>
      </div>
    </section>
  )
}

export default ConnectBank