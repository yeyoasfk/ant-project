'use client'

import Link from 'next/link'
import { formatAmount } from '@/lib/utils'
import { useEffect } from 'react'

const RecentTransactions = ({
    transactions = [],
    accounts = [],
    currentAccountId
}: {
    transactions: any[],
    accounts: any[],
    currentAccountId: string
}) => {

    // 🔍 LOGS PARA DEBUGGING (Tu lógica original intacta)
    useEffect(() => {
        console.log("📝 [RecentTransactions] Props recibidas:", {
            transactionsCount: transactions?.length || 0,
            accountsCount: accounts?.length || 0,
            currentAccountId,
            isArray: Array.isArray(transactions),
            firstThree: transactions?.slice(0, 3).map((t: any) => ({
                id: t.id,
                description: t.description,
                amount: t.amount,
                date: t.date,
                antCategory: t.antCategory
            }))
        });

        if (!Array.isArray(transactions)) {
            console.error("❌ [RecentTransactions] transactions NO es un array:", typeof transactions, transactions);
        }

        if (transactions && transactions.length > 0) {
            transactions.forEach((t: any, index: number) => {
                if (!t.id) {
                    console.warn(`⚠️ [RecentTransactions] Transacción ${index} sin ID:`, t);
                }
                if (typeof t.amount === 'undefined' || isNaN(Number(t.amount))) {
                    console.warn(`⚠️ [RecentTransactions] Transacción ${index} con amount inválido:`, t.amount);
                }
            });
        }
    }, [transactions, accounts, currentAccountId]);

    // 🛡️ VALIDACIÓN Y SANITIZACIÓN
    const safeTransactions = Array.isArray(transactions)
        ? transactions.filter((t: any) => {
            const hasId = t.id !== undefined && t.id !== null;
            const hasAmount = typeof t.amount !== 'undefined' && !isNaN(Number(t.amount));
            const hasDescription = t.description && typeof t.description === 'string';

            if (!hasId || !hasAmount || !hasDescription) {
                console.warn("⚠️ [RecentTransactions] Transacción filtrada por datos inválidos:", t);
                return false;
            }
            return true;
        })
        : [];

    // 🧠 Buscamos la cuenta actual para mostrar su información en el banner
    const currentAccount = accounts.find((a: any) => a.fintocAccountId === currentAccountId) || accounts[0];

    // Si aún no hay cuentas, no renderizamos esta sección
    if (!currentAccount) return null;

    return (
        <div className="flex flex-col gap-4 sm:gap-6">

            {/* ENCABEZADO */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                <h2 className="text-16 sm:text-18 md:text-20 font-bold text-white">Resumen de Movimientos</h2>
                <Link
                    href="/transaction-history"
                    className="text-12 sm:text-14 font-semibold text-[#9d6dc0] hover:text-[#653584] hover:underline whitespace-nowrap transition-colors"
                >
                    Ver todas ({safeTransactions.length})
                </Link>
            </div>

            {/* PESTAÑAS DE BANCOS */}
            <div className="flex w-full overflow-x-auto gap-2 sm:gap-4 border-b border-white/10 pb-2 custom-scrollbar">
                {accounts.map((account: any) => {
                    const isActive = account.fintocAccountId === currentAccount.fintocAccountId;
                    return (
                        <Link
                            key={account.fintocAccountId}
                            href={`/?id=${account.fintocAccountId}`}
                            className={`px-2 sm:px-3 py-2 text-13 sm:text-14 md:text-15 font-semibold whitespace-nowrap transition-all border-b-2 ${isActive
                                    ? 'border-[#653584] text-[#9d6dc0]'
                                    : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {account.institutionName}
                        </Link>
                    )
                })}
            </div>

            {/* MINI BANNER DEL BANCO SELECCIONADO */}
            <div className="flex flex-col justify-between gap-3 sm:gap-4 rounded-xl border border-[#572371]/40 bg-[#2d183b]/40 backdrop-blur-sm p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-[#572371] text-white font-bold text-base sm:text-xl shadow-glow-purple uppercase flex-shrink-0">
                        {currentAccount.institutionName[0]}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-14 sm:text-16 font-bold text-white truncate">{currentAccount.institutionName}</h2>
                        <p className="text-11 sm:text-12 font-medium text-[#9d6dc0] bg-[#3b174d]/60 px-2 py-0.5 rounded-full inline-block mt-1">
                            **** {currentAccount.number ? currentAccount.number.slice(-4) : '****'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:items-end bg-white/5 px-3 sm:px-4 py-2 rounded-xl border border-white/10">
                    <p className="text-11 sm:text-12 font-medium text-gray-400 uppercase tracking-wider">Saldo Disponible</p>
                    <p className="text-16 sm:text-18 font-bold text-[#9d6dc0]">{formatAmount(currentAccount.currentBalance)}</p>
                </div>
            </div>

            {/* LISTA DE TRANSACCIONES */}
            <div className="flex flex-col gap-2 sm:gap-3 rounded-2xl border border-white/10 bg-[#1f1019]/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl min-h-[100px]">
                {safeTransactions.length > 0 ? (
                    safeTransactions.slice(0, 5).map((t: any) => {
                        const rawAmount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
                        const isDebit = t.type === 'debit' || rawAmount < 0;
                        const amount = Math.abs(rawAmount);
                        const description = t.description || 'Sin descripción';
                        const antCategory = t.antCategory || 'Gasto General';
                        const displayChar = description && description.length > 0
                            ? description[0].toUpperCase()
                            : '?';

                        return (
                            <div key={t.id || `trans_${Date.now()}_${Math.random()}`} className="flex items-center justify-between border-b border-white/5 pb-2.5 sm:pb-3 last:border-b-0 last:pb-0 gap-2">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <div className="flex size-8 sm:size-10 items-center justify-center rounded-full bg-[#3b174d]/80 border border-[#572371]/40 text-[#9d6dc0] font-bold uppercase flex-shrink-0 text-sm sm:text-base">
                                        {displayChar}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="text-13 sm:text-14 font-semibold text-gray-100 truncate">
                                            {description}
                                        </h3>
                                        <p className="text-11 sm:text-12 text-gray-500 truncate">{antCategory}</p>
                                    </div>
                                </div>
                                <p className={`text-13 sm:text-14 font-semibold whitespace-nowrap ${isDebit ? 'text-red-400' : 'text-green-400'}`}>
                                    {isDebit ? '-' : '+'}{formatAmount(amount)}
                                </p>
                            </div>
                        )
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                        <p className="text-13 sm:text-14">No hay movimientos en esta cuenta 🍃</p>
                        {transactions && !Array.isArray(transactions) && (
                            <p className="text-11 text-red-400 mt-2">
                                ⚠️ Error: Los datos recibidos no son válidos
                            </p>
                        )}
                    </div>
                )}
            </div>

        </div>
    )
}

export default RecentTransactions