import Sidebar from "../../components/Sidebar";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Simulación de usuario logueado (luego vendrá de Supabase)
  const loggedIn = { firstName: 'Diego', lastName: 'Hormiga', email: 'diego@hormiga.cl' };

  return (
    // 1. Agregamos 'overflow-hidden' aquí para congelar la pantalla principal por completo
    <main className="flex h-screen w-full font-inter overflow-hidden bg-white">
      
      <Sidebar user={loggedIn} />

      {/* 2. Cambiamos 'size-full' por 'flex-1' y agregamos 'overflow-y-auto' */}
      <div className="flex flex-1 flex-col overflow-y-auto custom-scrollbar">
        
        {/* Barra superior solo para Móvil */}
        <div className="root-layout flex justify-between items-center p-4 md:hidden border-b border-gray-200 bg-white sticky top-0 z-10">
          <Image src="/icons/logo.svg" width={30} height={30} alt="menu icon" />
          <div className="flex items-center gap-2">
             <span className="font-bold text-black-1">HORMIGA</span>
             {/* Aquí iría el MobileNav */}
          </div>
        </div>

        {/* 3. El contenido de la página vivirá y hará scroll dentro de esta caja */}
        {children}
      </div>
    </main>
  );
}