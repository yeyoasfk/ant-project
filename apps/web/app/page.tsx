
import { createClient } from '@supabase/supabase-js';
import ScannerButton from '../components/ScannerButton';
import ExpenseChart from '../components/ExpenseChart';
import ConnectBankButton from '../components/ConnectBankButton';

// Conexión a tu Supabase en la Nube
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Evitamos que Next.js guarde caché de esta página para siempre tener datos frescos
export const revalidate = 0;

export default async function Home() {
  // 1. Pedimos los datos a la nube ordenados por fecha
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  // 2. Separamos y Calculamos totales
  const hormigas = transactions?.filter((t) => t.is_hormiga) || [];
  const necesarios = transactions?.filter((t) => !t.is_hormiga) || [];

  const totalHormiga = hormigas.reduce((acc, curr) => acc + curr.amount, 0);
  const totalNecesario = necesarios.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center p-4 md:p-10">
      <div className="w-full max-w-md space-y-6">
        {/* ENCABEZADO CON BOTÓN */}
        <div className="flex justify-between items-center px-2">
            <h1 className="font-bold text-gray-700 text-lg">Hormiga 🐜</h1>
            <ConnectBankButton /> {/* <--- AQUÍ ESTÁ EL BOTÓN */}
        </div>

        {/* --- TARJETA 1: RESUMEN TOTAL --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-gray-500 font-medium uppercase tracking-wide text-xs">
            Gasto Hormiga Detectado
          </h2>
          <div className="text-5xl font-extrabold text-red-600 mt-2">
            ${totalHormiga.toLocaleString('es-CL')}
          </div>
          <p className="text-gray-400 text-sm mt-2">En tus últimos movimientos</p>
        </div>

        {/* --- TARJETA 2: GRÁFICO VISUAL --- */}
        <ExpenseChart 
            hormigaTotal={totalHormiga} 
            necesarioTotal={totalNecesario} 
        />

        {/* --- BOTÓN DE INTELIGENCIA ARTIFICIAL --- */}
        <ScannerButton />

        {/* --- TARJETA 3: LISTA DE MOVIMIENTOS --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 text-sm">Historial de Transacciones</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {transactions?.map((t) => (
              <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Indicador Visual: Rojo = Hormiga, Verde = Necesario */}
                  <div className={`w-3 h-3 rounded-full ${t.is_hormiga ? 'bg-red-500' : 'bg-green-400'}`} />
                  
                  <div>
                    <p className="font-medium text-gray-900 text-sm uppercase">
                      {t.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <span className={`font-bold text-sm ${t.is_hormiga ? 'text-red-600' : 'text-gray-900'}`}>
                  ${t.amount.toLocaleString('es-CL')}
                </span>
              </div>
            ))}

            {(!transactions || transactions.length === 0) && (
               <div className="p-8 text-center text-gray-400 text-sm">
                 No hay movimientos registrados aún.
               </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
