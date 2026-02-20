import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col lg:flex-row min-h-screen w-full justify-between font-inter bg-white">
      {/* Lado Izquierdo: Formulario - Mobile First */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-0">
        <div className="mb-6 sm:mb-8 flex items-center gap-2">
            <Image 
              src="/icons/logo.svg" 
              width={32}
              height={32}
              alt="Hormiga Logo"
              className="sm:w-10 sm:h-10"
            />
            <h1 className="text-22 sm:text-26 md:text-28 lg:text-32 font-bold font-ibm-plex-serif text-black-1">HORMIGA</h1>
        </div>
        {children}
      </div>

      {/* Lado Derecho: Imagen Decorativa (Solo Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-bank-gradient items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('/icons/gradient-mesh.svg')] opacity-20 bg-cover"></div>
         <div className="text-white text-center p-8 lg:p-10 z-10 max-w-xl">
             <h2 className="text-28 lg:text-32 xl:text-36 font-bold mb-4">Gestiona tus gastos</h2>
             <p className="text-14 lg:text-16 text-blue-100 leading-relaxed">La forma más inteligente de detectar gastos hormiga.</p>
         </div>
      </div>
    </main>
  );
}