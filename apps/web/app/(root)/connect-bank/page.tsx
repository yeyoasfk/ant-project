import BankConnect from '../../../components/BankConnect'
import HeaderBox from '../../../components/HeaderBox'
import { createClient } from '../../../lib/supabase/server' // 👈 Usamos esto en lugar de user.actions
import { redirect } from 'next/navigation'

const ConnectBank = async () => {
  // 1. Obtener el cliente de Supabase
  const supabase = await createClient();
  
  // 2. Obtener la sesión del usuario
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Si no hay usuario, mandar al Login
  if (!user) {
    redirect('/sign-in');
  }

  // 4. Mapear los datos (Igual que en el Home)
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
                <BankConnect />
            </div>
        </div>
      </div>
    </section>
  )
}

export default ConnectBank