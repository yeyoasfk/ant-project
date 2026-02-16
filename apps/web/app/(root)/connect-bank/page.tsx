import HeaderBox from '@/components/HeaderBox'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FintocButton from '@/components/FintocButton' // 👈 Importación limpia

export const metadata = {
  title: 'Conectar Banco | Hormiga',
};

const ConnectBank = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  return (
    
    <section className="flex flex-col p-8 lg:p-12 w-full">
      <div className="flex flex-col gap-8">

        <HeaderBox 
          title="Conectar Banco"
          subtext="Vincula tu cuenta principal para rastrear tus gastos hormiga de forma segura."
        />

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
            🛡️ Usamos Fintoc para leer tus movimientos de forma segura.
          </div>
          
          <div className="flex justify-start mt-4">
            <FintocButton />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ConnectBank