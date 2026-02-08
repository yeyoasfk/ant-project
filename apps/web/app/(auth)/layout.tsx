import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen w-full justify-between font-inter">
      {/* Lado Izquierdo: Formulario */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-10">
        <div className="mb-8 flex items-center gap-2">
            <Image src="/icons/logo.svg" width={40} height={40} alt="Hormiga Logo" />
            <h1 className="text-3xl font-bold font-ibm-plex-serif text-black-1">HORMIGA</h1>
        </div>
        {children}
      </div>

      {/* Lado Derecho: Imagen Decorativa (Solo Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-bank-gradient items-center justify-center relative">
         <div className="absolute inset-0 bg-[url('/icons/gradient-mesh.svg')] opacity-20 bg-cover"></div>
         <div className="text-white text-center p-10 z-10">
             <h2 className="text-4xl font-bold mb-4">Gestiona tus gastos</h2>
             <p className="text-blue-100">La forma más inteligente de detectar gastos hormiga.</p>
         </div>
      </div>
    </main>
  );
}