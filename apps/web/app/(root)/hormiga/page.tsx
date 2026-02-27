import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDetailedAccounts, getAccountMovements } from '@/lib/actions/bank.actions';
import HeaderBox from '@/components/HeaderBox';
import HormigaDashboard from '@/components/HormigaDashboard';

export const dynamic = 'force-dynamic';

const HormigaPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) => {
    const params = await searchParams;
    const urlAccountId = params?.id as string | undefined;

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/sign-in');

    // 1. Obtener cuentas del usuario
    const { data: dbLinks } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id);

    if (!dbLinks || dbLinks.length === 0) {
        return (
            <section className="flex w-full flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
                <HeaderBox
                    title="HORMIGA"
                    subtext="Vincula una cuenta bancaria para ver tus gastos hormiga."
                />
            </section>
        );
    }

    // 2. Obtener detalles de todas las cuentas y saldo total
    const allAccounts = await getDetailedAccounts(dbLinks);
    const totalCurrentBalance = allAccounts.reduce(
        (acc, curr) => acc + (curr.currentBalance || 0),
        0
    );

    // 3. Identificar cuenta seleccionada (por searchParams o primera por defecto)
    const currentAccount = urlAccountId
        ? allAccounts.find((a) => a.fintocAccountId === urlAccountId) || allAccounts[0]
        : allAccounts[0];

    // 4. Obtener movimientos de la cuenta seleccionada
    let rawTransactions: any[] = [];
    if (currentAccount) {
        rawTransactions = await getAccountMovements(
            currentAccount.linkToken,
            currentAccount.fintocAccountId
        );
    }

    // 5. Mapear transacciones — montos positivos + flag isAnt
    const transactions = rawTransactions.map((t: any) => ({
        id: t.id || t.db_id || '',
        description: t.description || 'Sin descripción',
        amount: Math.abs(typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0),
        date: t.date || new Date().toISOString(),
        type: t.type || 'debit',
        categoryName: t.categoryName || 'Sin Categoría',
        categoryColor: t.categoryColor || '#808080',
        isAnt: t.antCategory === 'Gasto Hormiga',
    }));

    return (
        <section className="flex w-full flex-col gap-6 px-5 py-7 lg:py-12 min-h-screen">
            <HeaderBox
                title="HORMIGA"
                subtext="Control de tus gastos hormiga: pequeños gastos, gran impacto."
            />
            <HormigaDashboard
                totalCurrentBalance={totalCurrentBalance}
                accounts={allAccounts}
                currentAccountId={currentAccount?.fintocAccountId || ''}
                transactions={transactions}
            />
        </section>
    );
};

export default HormigaPage;
