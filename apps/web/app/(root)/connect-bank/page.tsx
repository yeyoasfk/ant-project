import HeaderBox from '@/components/HeaderBox'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FintocButton from '@/components/FintocButton'

const ConnectBank = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  return (
    <section className="no-scrollbar flex w-full flex-1 flex-col gap-8 px-5 sm:px-8 py-7 lg:py-12">
      <HeaderBox 
        type="greeting"
        title="Conecta tu Banco"
        subtext="Vincula tu cuenta principal para rastrear tus gastos hormiga."
        user={user.user_metadata.first_name || 'Usuario'}
      />

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
          🛡️ Usamos Fintoc para leer tus movimientos de forma segura.
        </div>
        
        <div className="flex justify-start mt-4">
          <FintocButton />
        </div>
      </div>
    </section>
  )
}

export default ConnectBank