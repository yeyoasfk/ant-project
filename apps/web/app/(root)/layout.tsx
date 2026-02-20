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
    // Layout principal responsive - Mobile first
    <main className="flex flex-col md:flex-row h-screen w-full font-inter overflow-hidden bg-white">
      
      {/* Sidebar - Oculto en mobile, visible en md+ */}
      <div className="hidden md:block">
        <Sidebar user={loggedIn} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        
        {/* Barra superior solo para Móvil - Sticky */}
        <div className="md:hidden flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white sticky top-0 z-40 gap-3 min-h-[60px]">
          <Image 
            src="/icons/logo.svg" 
            width={24} 
            height={24} 
            alt="menu icon"
            className="sm:w-8 sm:h-8"
          />
          <div className="flex items-center gap-2">
             <span className="font-bold text-black-1 text-14 sm:text-16">HORMIGA</span>
          </div>
          {/* Espacio para future mobile menu button */}
          <div className="flex-1"></div>
        </div>

        {/* Contenido principal con scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
          {children}
        </div>
      </div>
    </main>
  );
}