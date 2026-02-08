import HeaderBox from '../../../components/HeaderBox'

const ConnectBank = () => {
  return (
    <section className="flex w-full flex-col gap-8 px-5 sm:px-8 py-7 lg:py-12 bg-gray-50 min-h-screen">
      <HeaderBox 
        type="title"
        title="Conectar Banco"
        subtext="Vincula una nueva cuenta para gestionar tus finanzas."
      />
      
      <div className="flex flex-col items-center justify-center space-y-4 p-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
              🏦
          </div>
          <h2 className="text-xl font-bold text-gray-900">Integración con Fintoc</h2>
          <p className="text-gray-500 text-center max-w-md">
              Aquí irá el widget de Fintoc para conectar tu banco de forma segura.
              (Próximamente en la siguiente fase).
          </p>
          
          <button className="bg-bankGradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Iniciar Conexión (Simulado)
          </button>
      </div>
    </section>
  )
}

export default ConnectBank