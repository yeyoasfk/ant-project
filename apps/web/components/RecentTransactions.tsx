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
        <div className="flex flex-col gap-6">
            
            {/* ENCABEZADO */}
            <div className="flex items-center justify-between">
                <h2 className="text-18 font-bold text-gray-900">Resumen de Movimientos</h2>
                <Link
                    href="/transaction-history"
                    className="text-14 font-semibold text-blue-600 hover:underline"
                >
                    Ver todas ({safeTransactions.length})
                </Link>
            </div>

            {/* 🆕 PESTAÑAS DE BANCOS (TABS) */}
            <div className="flex w-full overflow-x-auto gap-4 border-b border-gray-200 pb-2 custom-scrollbar">
                {accounts.map((account: any) => {
                    const isActive = account.fintocAccountId === currentAccount.fintocAccountId;
                    return (
                        <Link 
                            key={account.fintocAccountId} 
                            href={`/?id=${account.fintocAccountId}`}
                            className={`px-2 py-2 font-semibold whitespace-nowrap transition-all border-b-2 ${
                                isActive 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {account.institutionName}
                        </Link>
                    )
                })}
            </div>

            {/* 🆕 MINI BANNER DEL BANCO SELECCIONADO */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl shadow-sm uppercase">
                        {currentAccount.institutionName[0]}
                    </div>
                    <div>
                        <h2 className="text-16 font-bold text-blue-900">{currentAccount.institutionName}</h2>
                        <p className="text-12 font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            **** {currentAccount.number ? currentAccount.number.slice(-4) : '****'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col md:items-end bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-12 font-medium text-gray-500 uppercase tracking-wider">Saldo Disponible</p>
                    <p className="text-18 font-bold text-blue-600">{formatAmount(currentAccount.currentBalance)}</p>
                </div>
            </div>

            {/* LISTA DE TRANSACCIONES (Tu diseño original) */}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[100px]">
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
                            <div key={t.id || `trans_${Date.now()}_${Math.random()}`} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold uppercase">
                                        {displayChar}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-14 font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-[250px]">
                                            {description}
                                        </h3>
                                        <p className="text-12 text-gray-500">{antCategory}</p>
                                    </div>
                                </div>
                                <p className={`text-14 font-semibold ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                                    {isDebit ? '-' : '+'}{formatAmount(amount)}
                                </p>
                            </div>
                        )
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                        <p>No hay movimientos en esta cuenta 🍃</p>
                        {transactions && !Array.isArray(transactions) && (
                            <p className="text-xs text-red-500 mt-2">
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