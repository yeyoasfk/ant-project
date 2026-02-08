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
    <main className="flex h-screen w-full font-inter">
      <Sidebar user={loggedIn} />

      <div className="flex size-full flex-col">
        {/* Barra superior solo para Móvil */}
        <div className="root-layout flex justify-between items-center p-4 md:hidden border-b border-gray-200">
          <Image src="/icons/logo.svg" width={30} height={30} alt="menu icon" />
          <div className="flex items-center gap-2">
             <span className="font-bold text-black-1">HORMIGA</span>
             {/* Aquí iría el MobileNav */}
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}