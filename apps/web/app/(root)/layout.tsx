import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";
import { createClient } from "../../lib/supabase/server";
import { getDetailedAccounts } from "../../lib/actions/bank.actions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Obtener usuario real de Supabase
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const loggedIn = {
    firstName: user?.user_metadata?.first_name || 'Diego',
    lastName: user?.user_metadata?.last_name || 'Albornoz',
    email: user?.email || 'diego@hormiga.cl',
  };

  // Obtener bancos reales del usuario (mismo fetch que page.tsx)
  let banks: any[] = [];
  if (user) {
    const { data: dbLinks } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbLinks && dbLinks.length > 0) {
      const allAccounts = await getDetailedAccounts(dbLinks);
      banks = allAccounts.slice(0, 2);
    }
  }

  return (
    <main className="relative flex flex-col md:flex-row h-screen w-full font-inter overflow-hidden bg-[#110916]">

      {/* ── Mesh Gradient blobs (decorativo) ──────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Blob superior-izq */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#3b174d]/60 blur-[120px]" />
        {/* Blob central-derecha */}
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-[#572371]/40 blur-[100px]" />
        {/* Blob inferior */}
        <div className="absolute -bottom-40 left-1/3 w-[350px] h-[350px] rounded-full bg-[#2d183b]/70 blur-[90px]" />
      </div>

      {/* ── Desktop Sidebar - oculto en mobile ── */}
      <div className="hidden md:block relative z-10">
        <Sidebar user={loggedIn} />
      </div>

      {/* ── Mobile top bar + slide-over drawers ── */}
      <MobileNav user={loggedIn} transactions={[]} banks={banks} />

      {/* ── Main content area ─────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden w-full relative z-10">
        <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
          {children}
        </div>
      </div>
    </main>
  );
}