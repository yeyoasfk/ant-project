import HeaderBox from '../../../components/HeaderBox'
import TransactionsTable from '../../../components/TransactionsTable'
import BankInfo from '../../../components/BankInfo'

// ✅ CORRECCIÓN 1: Definimos searchParams como una Promesa
interface SearchParamProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// ✅ CORRECCIÓN 2: El componente ahora es 'async'
const TransactionHistory = async ({ searchParams }: SearchParamProps) => {
  // ✅ CORRECCIÓN 3: Esperamos a que lleguen los parámetros
  const params = await searchParams;
  const accountId = (params.id as string) || '1';

  // --- DATOS SIMULADOS ---
  const mockAccounts = [
      { id: '1', name: 'Banco Santander', currentBalance: 1250000, mask: '9999', type: 'debit' },
      { id: '2', name: 'Banco Estado', currentBalance: 50000, mask: '1234', type: 'debit' },
      { id: '3', name: 'Banco Falabella', currentBalance: 320500, mask: '5678', type: 'credit' },
  ];

  const allTransactions = [
    // --- Santander (ID 1) ---
    { id: 1, accountId: '1', name: 'Spotify AB', amount: 4500, date: '2026-02-05T10:00:00', category: 'Suscripciones', type: 'debit' },
    { id: 2, accountId: '1', name: 'Transferencia Mamá', amount: 50000, date: '2026-02-04T15:30:00', category: 'Ingreso', type: 'credit' },
    { id: 3, accountId: '1', name: 'Uber Eats', amount: 12400, date: '2026-02-03T20:15:00', category: 'Comida', type: 'debit' },
    
    // --- Banco Estado (ID 2) ---
    { id: 4, accountId: '2', name: 'Metro de Santiago', amount: 800, date: '2026-02-06T08:00:00', category: 'Transporte', type: 'debit' },
    { id: 5, accountId: '2', name: 'Carga Bip!', amount: 5000, date: '2026-02-05T08:00:00', category: 'Transporte', type: 'debit' },
    { id: 6, accountId: '2', name: 'Botillería El Cielo', amount: 15000, date: '2026-02-04T22:00:00', category: 'Comida', type: 'debit' },

    // --- Falabella (ID 3) ---
    { id: 7, accountId: '3', name: 'Lider Express', amount: 35600, date: '2026-02-01T18:45:00', category: 'Comida', type: 'debit' },
    { id: 8, accountId: '3', name: 'Netflix', amount: 8900, date: '2026-01-28T10:00:00', category: 'Suscripciones', type: 'debit' },
  ];

  // Buscamos la cuenta actual (con validación segura '!')
  const currentAccount = mockAccounts.find(a => a.id === accountId) || mockAccounts[0]!;

  // Filtramos las transacciones
  const filteredTransactions = allTransactions.filter(t => t.accountId === currentAccount.id);

  return (
    <div className="flex flex-col gap-8 bg-gray-50 px-5 py-7 lg:py-12 min-h-screen">
      
      {/* Encabezado */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <HeaderBox 
            title="Historial de Transacciones"
            subtext="Consulta tus ingresos y gastos por cuenta."
        />
      </div>

      <div className="space-y-6">
        {/* Banner Azul Dinámico */}
        <div className="flex flex-col gap-2">
            <BankInfo account={currentAccount} />
        </div>

        {/* Tabla Filtrada */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-18 font-bold text-gray-900">
                  Movimientos de {currentAccount.name}
                </h2>
            </div>
            
            {filteredTransactions.length > 0 ? (
              <TransactionsTable transactions={filteredTransactions} />
            ) : (
              <div className="py-10 text-center text-gray-500">
                No hay movimientos registrados en esta cuenta.
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default TransactionHistory