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
    <main className="flex flex-col md:flex-row h-screen w-full font-inter overflow-hidden bg-white">

      {/* ── Desktop Sidebar - oculto en mobile ── */}
      <div className="hidden md:block">
        <Sidebar user={loggedIn} />
      </div>

      {/* ── Mobile top bar + slide-over drawers ── */}
      <MobileNav user={loggedIn} transactions={[]} banks={banks} />

      {/* ── Main content area ─────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
          {children}
        </div>
      </div>
    </main>
  );
}