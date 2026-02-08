import BankCard from '../../../components/BankCard';
import HeaderBox from '../../../components/HeaderBox';

const MyBanks = () => {
  // Simulación de Usuario
  const loggedIn = { firstName: 'Diego', lastName: 'Hormiga', email: 'diego@hormiga.cl' };

  // Simulación de Bancos (Agregamos un tercero para ver el efecto Grid)
  const accounts = [
    { id: '1', name: 'Banco Santander', currentBalance: 1250000, mask: '9999' },
    { id: '2', name: 'Banco Estado', currentBalance: 50000, mask: '1234' },
    { id: '3', name: 'Banco Falabella', currentBalance: 320500, mask: '5678' },
  ];

  return (
    <section className="flex w-full flex-col gap-8 bg-gray-50 px-5 py-7 lg:py-12 min-h-screen">
      <div className="flex flex-col gap-2">
        {/* Título */}
        <HeaderBox 
          title="Mis Cuentas Bancarias"
          subtext="Gestiona tus actividades bancarias y límites de gasto."
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-18 font-bold text-gray-900">Tus Tarjetas</h2>
        
        {/* GRID: Aquí está la magia para que se acomoden automáticamente */}
        <div className="flex flex-wrap gap-6">
          {accounts.map((a, index) => (
            <div key={a.id} className="flex flex-col gap-2">
                {/* Alternamos colores: 
                    Pares = Azul (default)
                    Impares = Morado ('purple')
                */}
                <BankCard 
                  account={a}
                  userName={`${loggedIn.firstName} ${loggedIn.lastName}`}
                  showBalance={true} // Esto mostrará el "Límite Mensual" abajo
                  color={index % 2 === 0 ? 'blue' : 'purple'} 
                />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MyBanks