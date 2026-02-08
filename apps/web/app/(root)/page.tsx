import HeaderBox from '../../components/HeaderBox'
import TotalBalanceBox from '../../components/TotalBalanceBox'
import RightSidebar from '../../components/RightSidebar'
import TransactionsTable from '../../components/TransactionsTable' // <--- Importamos
import Link from 'next/link'

export default function Home() {
  const loggedIn = { firstName: 'Diego', lastName: 'Hormiga', email: 'diego@hormiga.cl' };
  
  // Datos MOCK (Simulados) para probar el diseño
  // Cuando conectemos Fintoc de verdad, esto vendrá de la Base de Datos
  const mockTransactions = [
    { id: 1, name: 'Spotify AB', amount: 4500, date: '2026-02-05T10:00:00', category: 'Suscripciones', type: 'debit' },
    { id: 2, name: 'Transferencia Mamá', amount: 50000, date: '2026-02-04T15:30:00', category: 'Ingreso', type: 'credit' },
    { id: 3, name: 'Uber Eats', amount: 12400, date: '2026-02-03T20:15:00', category: 'Comida', type: 'debit' },
    { id: 4, name: 'Metro de Santiago', amount: 800, date: '2026-02-03T08:00:00', category: 'Transporte', type: 'debit' },
    { id: 5, name: 'Lider Express', amount: 35600, date: '2026-02-01T18:45:00', category: 'Comida', type: 'debit' },
  ];

  const mockBanks = [
      { id: '1', name: 'Banco Santander', currentBalance: 1250000, mask: '9999' },
      { id: '2', name: 'Banco Estado', currentBalance: 50000, mask: '1234' }
  ];

  return (
    <section className="no-scrollbar flex w-full flex-row max-xl:max-h-screen max-xl:overflow-y-scroll">
      
      {/* COLUMNA CENTRAL */}
      <div className="no-scrollbar flex w-full flex-1 flex-col gap-8 px-5 sm:px-8 py-7 lg:py-12">
        <header className="flex flex-col justify-between gap-8">
          <HeaderBox 
            type="greeting"
            title="Bienvenido,"
            user={loggedIn?.firstName || 'Invitado'}
            subtext="Accede y gestiona tus gastos hormiga eficientemente."
          />

          <TotalBalanceBox 
            accounts={[]}
            totalBanks={2}
            totalCurrentBalance={1300000}
          />
        </header>

        {/* SECCIÓN TRANSACCIONES RECIENTES */}
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-18 font-semibold text-gray-900">Transacciones Recientes</h2>
                <Link href="/transaction-history" className="text-14 font-semibold text-gray-600 hover:text-blue-600 border px-4 py-2 rounded-lg bg-white shadow-sm">
                    Ver todo
                </Link>
            </div>

            {/* Renderizamos la tabla aquí */}
            <div className="bg-white rounded-xl border border-gray-200 p-2">
                <TransactionsTable transactions={mockTransactions} />
            </div>
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <RightSidebar 
        user={loggedIn}
        transactions={mockTransactions}
        banks={mockBanks} 
      />

    </section>
  )
}