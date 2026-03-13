/**
 * TransactionCategoryModal.tsx
 * 
 * Componente modal INDEPENDIENTE para categorizar transacciones.
 * Este componente está completamente separado de la tabla,
 * renderizado en el nivel más alto para evitar problemas de stacking context.
 */

"use client"

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { formatAmount, cn, getCategoryIcon } from '@/lib/utils'
import { categorizeTransaction } from '@/lib/actions/transaction.actions'

export interface ModalTransaction {
  id: string
  db_id?: string
  name: string
  amount: number
  date: string
  categoryId?: string | null
  categoryName: string
  categoryColor?: string
  isAnt?: boolean
}

interface TransactionCategoryModalProps {
  transaction: ModalTransaction | null
  categories: any[]
  isOpen: boolean
  onClose: () => void
}

export default function TransactionCategoryModal({
  transaction,
  categories,
  isOpen,
  onClose,
}: TransactionCategoryModalProps) {
  // Estados del modal - completamente locales a este componente
  const [isSaving, setIsSaving] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [editCategoryId, setEditCategoryId] = useState<string>('')
  const [editIsAnt, setEditIsAnt] = useState<boolean>(false)
  const [createRule, setCreateRule] = useState<boolean>(false)
  const [ruleKeyword, setRuleKeyword] = useState<string>('')
  const [applyToPast, setApplyToPast] = useState<boolean>(false)

  // Actualizar estados cuando se abre el modal
  if (transaction && (editCategoryId !== (transaction.categoryId || '') || !isCategoryDropdownOpen)) {
    // Solo actualizar una vez al abrir
    if (editCategoryId === '' && transaction.categoryId) {
      setEditCategoryId(transaction.categoryId)
      setEditIsAnt(transaction.isAnt || false)
      const safeName = transaction.name || ''
      const firstWord = safeName.split(' ')[0] || ''
      setRuleKeyword(firstWord.length > 3 ? firstWord : safeName.substring(0, 8))
    }
  }

  const handleClose = () => {
    setEditCategoryId('')
    setEditIsAnt(false)
    setCreateRule(false)
    setApplyToPast(false)
    setRuleKeyword('')
    setIsCategoryDropdownOpen(false)
    onClose()
  }

  const handleSaveCategory = async () => {
    if (!transaction || !transaction.db_id) return
    setIsSaving(true)

    await categorizeTransaction({
      transactionDbId: transaction.db_id,
      categoryId: editCategoryId || null,
      isAntExpense: editIsAnt,
      ruleKeyword: createRule ? ruleKeyword : undefined,
      applyToPast: createRule ? applyToPast : false,
    })

    setIsSaving(false)
    handleClose()
  }

  // Si no está abierto o no hay transacción, no renderizar nada
  if (!isOpen || !transaction) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#1f1019] border border-white/10 rounded-2xl p-5 sm:p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 md:mb-8">
          <div className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-[#572371]/40 border border-[#9d6dc0]/50 flex-shrink-0">
            <span className="text-lg sm:text-xl">📂</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-18 sm:text-20 font-bold text-white">Categorizar Gasto</h2>
            <p className="text-12 sm:text-13 text-gray-400 truncate">{transaction.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="space-y-5">
          {/* 1. SELECTOR DE CATEGORÍA */}
          <div>
            <label className="text-12 sm:text-13 font-semibold text-gray-300 mb-2 sm:mb-3 block uppercase tracking-wider">
              Categoría
            </label>

            {categories.length > 0 ? (
              <div className="relative">
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#9d6dc0]/60 text-white rounded-xl px-4 py-2.5 text-left transition-all duration-200"
                >
                  <div className="flex-shrink-0 flex items-center justify-center size-6 rounded-lg bg-[#572371]/60 border border-white/20 text-base">
                    <span>
                      {editCategoryId
                        ? getCategoryIcon(
                            categories.find((c: any) => c.id === editCategoryId)?.name || ''
                          )
                        : '✕'}
                    </span>
                  </div>
                  <span className="flex-1 text-13 sm:text-14 font-medium truncate">
                    {editCategoryId
                      ? categories.find((c: any) => c.id === editCategoryId)?.name ||
                        'Sin Categoría'
                      : 'Sin Categorizar'}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`size-4 text-white/60 flex-shrink-0 transition-transform duration-300 ${
                      isCategoryDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                {/* Panel desplegable */}
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1f1019]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    {/* Sin Categoría */}
                    <button
                      onClick={() => {
                        setEditCategoryId('')
                        setIsCategoryDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-13 sm:text-14
                        ${
                          editCategoryId === ''
                            ? 'bg-[#572371]/50 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <div
                        className={`flex-shrink-0 size-6 rounded-lg border flex items-center justify-center
                        ${
                          editCategoryId === ''
                            ? 'bg-[#572371]/80 border-[#9d6dc0]/60'
                            : 'bg-white/5 border-white/15'
                        }`}
                      >
                        <span className="text-xs">✕</span>
                      </div>
                      <span className="font-medium">Sin Categorizar</span>
                      {editCategoryId === '' && (
                        <div className="ml-auto flex-shrink-0 size-2 rounded-full bg-[#c084fc]" />
                      )}
                    </button>

                    {/* Categorías */}
                    {categories.map((c: any) => {
                      const isActive = editCategoryId === c.id
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setEditCategoryId(c.id)
                            setIsCategoryDropdownOpen(false)
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-13 sm:text-14 border-t border-white/5
                            ${
                              isActive
                                ? 'bg-[#572371]/50 text-white'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          <div
                            className={`flex-shrink-0 size-6 rounded-lg border flex items-center justify-center text-base
                            ${
                              isActive
                                ? 'bg-[#572371]/80 border-[#9d6dc0]/60'
                                : 'bg-white/5 border-white/15'
                            }`}
                          >
                            {getCategoryIcon(c.name)}
                          </div>
                          <span className="font-medium truncate">{c.name}</span>
                          {isActive && (
                            <div className="ml-auto flex-shrink-0 size-2 rounded-full bg-[#c084fc]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-xl text-center text-sm text-gray-400">
                No hay categorías disponibles
              </div>
            )}
          </div>

          {/* 2. INTERRUPTOR GASTO HORMIGA */}
          <div className="p-4 sm:p-5 bg-[#572371]/20 border border-[#572371]/40 rounded-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-13 sm:text-14 font-bold text-white flex items-center gap-2 mb-0.5">
                  <span className="text-base">🐜</span>
                  ¿Es Gasto Hormiga?
                </h3>
                <p className="text-11 sm:text-12 text-gray-400">Incluir en monitoreo de fugas</p>
              </div>
              <button
                onClick={() => setEditIsAnt(!editIsAnt)}
                className={cn(
                  'flex-shrink-0 w-14 sm:w-16 h-7 sm:h-8 rounded-full transition-all duration-300 relative border-2',
                  editIsAnt
                    ? 'bg-gradient-to-r from-[#572371] to-[#9d6dc0] border-[#9d6dc0]'
                    : 'bg-gray-700/50 border-gray-600'
                )}
              >
                <div
                  className={cn(
                    'size-5 sm:size-6 bg-white rounded-full absolute top-0.5 transition-all duration-300',
                    editIsAnt ? 'right-1' : 'left-1'
                  )}
                />
              </button>
            </div>
          </div>

          {/* 3. MOTOR DE REGLAS AUTOMÁTICAS */}
          <div className="p-4 sm:p-5 border border-dashed border-white/20 rounded-xl bg-white/5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={createRule}
                onChange={(e) => setCreateRule(e.target.checked)}
                className="mt-1 size-4 accent-[#9d6dc0] cursor-pointer flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-13 sm:text-14 text-white font-semibold block mb-1">
                  Crear regla automática 🤖
                </span>
                <p className="text-11 sm:text-12 text-gray-400">
                  Futuros gastos con esta palabra se clasificarán automáticamente
                </p>
              </div>
            </label>

            {createRule && (
              <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  value={ruleKeyword}
                  onChange={(e) => setRuleKeyword(e.target.value)}
                  className="mt-3 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-13 text-white placeholder-gray-500 focus:border-[#9d6dc0] focus:outline-none focus:ring-1 focus:ring-[#9d6dc0]/30 transition-all"
                  placeholder="Ej: LIDER, EASYBOX, STARBUCKS"
                  maxLength={50}
                />

                <label className="flex items-start gap-3 cursor-pointer bg-black/20 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={applyToPast}
                    onChange={(e) => setApplyToPast(e.target.checked)}
                    className="mt-0.5 size-4 accent-[#9d6dc0] cursor-pointer flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-12 sm:text-13 text-white font-medium block">
                      Aplicar también al historial pasado ⏪
                    </span>
                    <p className="text-11 text-gray-400 mt-0.5 leading-snug">
                      Actualizará todos los movimientos anteriores que contengan "
                      {ruleKeyword || 'esta palabra'}".
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-3 pt-2 flex-col-reverse sm:flex-row">
            <button
              onClick={handleClose}
              className="px-4 sm:px-6 py-2.5 rounded-lg text-13 sm:text-14 font-semibold text-gray-300 border border-white/20 hover:border-white/40 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveCategory}
              disabled={isSaving}
              className="flex-1 px-4 sm:px-6 py-2.5 rounded-lg text-13 sm:text-14 font-bold text-white bg-gradient-to-r from-[#572371] to-[#9d6dc0] hover:opacity-90 active:opacity-80 flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
