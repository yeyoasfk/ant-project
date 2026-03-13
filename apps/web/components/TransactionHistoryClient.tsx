/**
 * TransactionHistoryClient.tsx
 * 
 * Cliente Component que proporciona el Context para el modal de categorización.
 * Envuelve el contenido (Suspense + TransactionsLoader) y renderiza el Modal
 * al nivel más alto para evitar problemas de stacking context.
 * 
 * Arquitectura:
 * - TransactionHistoryClient (Client) 
 *   ├─ TransactionModalProvider (proporciona: onSelectTransaction, closeModal, estado)
 *   │  ├─ Suspense + TransactionsLoader (Server)
 *   │  │  └─ TransactionsTable (Client, obtiene callbacks del contexto)
 *   │  └─ TransactionCategoryModal (renderizado aquí, al nivel más alto)
 */

'use client'

import { ReactNode } from 'react'
import { TransactionModalProvider, useTransactionModal } from './TransactionModalContext'
import TransactionCategoryModal from './TransactionCategoryModal'

interface TransactionHistoryClientProps {
  children: ReactNode
  categories: any[]
}

/**
 * Componente interno que renderiza el modal usando el contexto
 */
function ModalRenderer() {
  const { selectedTransaction, closeModal, categories } = useTransactionModal()

  return (
    <TransactionCategoryModal
      transaction={selectedTransaction}
      isOpen={!!selectedTransaction}
      categories={categories}
      onClose={closeModal}
    />
  )
}

/**
 * Componente público que proporciona el Provider
 */
export default function TransactionHistoryClient({
  children,
  categories,
}: TransactionHistoryClientProps) {
  return (
    <TransactionModalProvider categories={categories}>
      {/* 
        Children: Contiene el Suspense + TransactionsLoader
        TransactionsLoader renderiza TransactionsTable que accede al contexto
      */}
      {children}

      {/* 
        💎 MODAL AL NIVEL MÁS ALTO POSIBLE
        - z-index de 9999 para estar arriba de TODO
        - Separado del scroll context de la tabla
        - Estado gestionado por el Provider
        - Acceso a onSelectTransaction y closeModal a través del contexto
      */}
      <ModalRenderer />
    </TransactionModalProvider>
  )
}

