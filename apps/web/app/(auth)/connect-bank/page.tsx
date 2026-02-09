import BankConnect from '../../../components/BankConnect'
import Image from 'next/image'
import Link from 'next/link'

const ConnectBank = async () => {
  return (
    <section className="flex-center size-full max-sm:px-6">
      <div className="flex min-h-screen w-full max-w-[420px] flex-col justify-center gap-5 py-6 md:gap-8">
        
        {/* Header simple */}
        <Link href="/" className="cursor-pointer flex items-center gap-2">
            <div className="size-[40px] bg-bankGradient rounded-full flex items-center justify-center text-white font-bold text-xl">
                🐜
            </div>
            <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Hormiga</h1>
        </Link>

        <div className="flex flex-col gap-1 md:gap-3">
            <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
                Conecta tu Banco
                <p className="text-16 font-normal text-gray-600">
                    Vincula tu cuenta para que la Hormiga pueda rastrear tus gastos automáticamente.
                </p>
            </h1>
        </div>

        {/* Nuestro componente estrella */}
        <div className="flex flex-col gap-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                🛡️ Usamos <strong>Fintoc</strong> para leer tu información de forma segura. Tus claves bancarias nunca se comparten con nosotros.
            </div>
            
            <div className="flex justify-center mt-4">
                <BankConnect />
            </div>
        </div>

        <footer className="flex justify-center">
             <Link href="/" className="text-14 text-gray-400 hover:text-gray-600">
                Omitir por ahora
             </Link>
        </footer>
      </div>
    </section>
  )
}

export default ConnectBank