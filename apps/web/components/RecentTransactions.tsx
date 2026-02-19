'use client'

import Link from 'next/link'
import { formatAmount } from '@/lib/utils'
import { useEffect } from 'react'

const RecentTransactions = ({
    transactions = []
}: { transactions: any[] }) => {

    // 🔍 LOGS PARA DEBUGGING
    useEffect(() => {
        console.log("📝 [RecentTransactions] Props recibidas:", {
            transactionsCount: transactions?.length || 0,
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
    }, [transactions]);

    // 🛡️ VALIDACIÓN Y SANITIZACIÓN
    const safeTransactions = Array.isArray(transactions) 
        ? transactions.filter((t: any) => {
            // Filtrar transacciones con datos mínimos válidos
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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-18 font-bold text-gray-900">Transacciones de Hoy</h2>
                <Link
                    href="/transaction-history"
                    className="text-14 font-semibold text-blue-600 hover:underline"
                >
                    Ver todas ({safeTransactions.length})
                </Link>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[100px]">
                {safeTransactions.length > 0 ? (
                    safeTransactions.map((t: any) => {
                        // 🛡️ Lógica defensiva para determinar si es débito
                        const rawAmount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
                        const isDebit = t.type === 'debit' || rawAmount < 0;
                        const amount = Math.abs(rawAmount); // Siempre mostrar positivo visualmente
                        const description = t.description || 'Sin descripción';
                        const antCategory = t.antCategory || 'Gasto General';
                        const displayChar = description && description.length > 0 
                            ? description[0].toUpperCase() 
                            : '?';

                        return (
                            <div key={t.id || `trans_${Date.now()}_${Math.random()}`} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold uppercase">
                                        {displayChar}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-14 font-semibold text-gray-900 truncate max-w-[150px]">
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
                        <p>No hay movimientos en las últimas 24 hrs 🍃</p>
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
