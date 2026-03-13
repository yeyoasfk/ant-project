/**
 * TransactionModalContext.tsx
 * 
 * Context para proporcionar el callback onSelectTransaction 
 * que componentes como TransactionsTable pueden consumir sin recibir props directamente.
 * 
 * También proporciona el estado del modal (selectedTransaction, categorías).
 */

'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface SelectedTransaction {
  id: string
  db_id?: string
  name: string
  amount: number
  date: string
  type: 'debit' | 'credit'
  categoryId?: string | null
  categoryName: string
  categoryColor?: string
  isAnt?: boolean
}

interface TransactionModalContextType {
  selectedTransaction: SelectedTransaction | null
  onSelectTransaction: (transaction: any) => void
  closeModal: () => void
  categories: any[]
}

const TransactionModalContext = createContext<TransactionModalContextType | undefined>(
  undefined
)

interface TransactionModalProviderProps {
  children: ReactNode
  categories: any[]
}

export function TransactionModalProvider({
  children,
  categories,
}: TransactionModalProviderProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<SelectedTransaction | null>(null)

  const onSelectTransaction = (transaction: any) => {
    setSelectedTransaction({
      id: transaction.id,
      db_id: transaction.db_id,
      name: transaction.name,
      amount: transaction.amount,
      date: transaction.date,
      categoryId: transaction.categoryId,
      categoryName: transaction.categoryName,
      categoryColor: transaction.categoryColor,
      isAnt: transaction.isAnt,
      type: transaction.type,
    })
  }

  const closeModal = () => {
    setSelectedTransaction(null)
  }

  return (
    <TransactionModalContext.Provider
      value={{ selectedTransaction, onSelectTransaction, closeModal, categories }}
    >
      {children}
    </TransactionModalContext.Provider>
  )
}

// Hook para acceder al contexto
export function useTransactionModal() {
  const context = useContext(TransactionModalContext)
  if (!context) {
    throw new Error('useTransactionModal debe usarse dentro de TransactionModalProvider')
  }
  return context
}
