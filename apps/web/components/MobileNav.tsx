"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Home, CreditCard, History } from 'lucide-react'
import { cn } from '../lib/utils'
import Footer from './Footer'
import BankStack from './BankStack'

// ─── Nav links (same as Sidebar) ────────────────────────────────────────────
const sidebarLinks = [
    { icon: Home, route: '/', label: 'Inicio' },
    { icon: CreditCard, route: '/my-banks', label: 'Mis Bancos' },
    { icon: History, route: '/transaction-history', label: 'Historial' },
]

// ─── Types ───────────────────────────────────────────────────────────────────
interface MobileNavProps {
    user: {
        firstName: string
        lastName: string
        email: string
    }
    transactions?: any[]
    banks?: any[]
}

// ─── Component ───────────────────────────────────────────────────────────────
const MobileNav = ({ user, transactions = [], banks = [] }: MobileNavProps) => {
    const [navOpen, setNavOpen] = useState(false)
    const [rightOpen, setRightOpen] = useState(false)

    const closeAll = () => {
        setNavOpen(false)
        setRightOpen(false)
    }

    return (
        <>
            {/* ── Top bar (mobile only) ─────────────────────────────────────── */}
            <header className="md:hidden flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-40 min-h-[60px]">

                {/* Hamburger button */}
                <button
                    onClick={() => setNavOpen(true)}
                    aria-label="Abrir menú"
                    className="flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Menu className="size-6 text-gray-700" />
                </button>

                {/* Logo + Brand */}
                <Link href="/" className="flex items-center gap-2" onClick={closeAll}>
                    <Image
                        src="/icons/logo.png"
                        width={32}
                        height={32}
                        alt="Hormiga logo"
                        className="size-8"
                    />
                    <span className="font-bold text-gray-900 text-base font-ibm-plex-serif">
                        HORMIGA
                    </span>
                </Link>

                {/* Right panel trigger */}
                <button
                    onClick={() => setRightOpen(true)}
                    aria-label="Ver perfil y bancos"
                    className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
                >
                    <span className="text-sm font-bold text-gray-600">
                        {user.firstName[0]}
                    </span>
                </button>
            </header>

            {/* ── Backdrop ─────────────────────────────────────────────────── */}
            {(navOpen || rightOpen) && (
                <div
                    className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    onClick={closeAll}
                />
            )}

            {/* ── LEFT Drawer – Navigation ──────────────────────────────────── */}
            <aside
                className={cn(
                    "md:hidden fixed top-0 left-0 h-full w-72 max-w-[85vw] z-50 bg-white shadow-2xl",
                    "flex flex-col justify-between pt-6 px-4 pb-4",
                    "transition-transform duration-300 ease-in-out",
                    navOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header inside drawer */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="flex items-center gap-2" onClick={closeAll}>
                            <Image
                                src="/icons/logo.png"
                                width={36}
                                height={36}
                                alt="Hormiga logo"
                                className="size-9"
                            />
                            <span className="text-xl font-bold font-ibm-plex-serif text-gray-900">
                                Hormiga
                            </span>
                        </Link>
                        <button
                            onClick={() => setNavOpen(false)}
                            aria-label="Cerrar menú"
                            className="size-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="size-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Nav links */}
                    <nav className="flex flex-col gap-2">
                        {sidebarLinks.map((item) => (
                            <Link
                                key={item.label}
                                href={item.route}
                                onClick={closeAll}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                                <item.icon className="size-5 text-gray-500" />
                                <span className="text-base font-semibold">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Footer with logout */}
                <Footer user={user} type="mobile" />
            </aside>

            {/* ── RIGHT Drawer – Profile & Banks ────────────────────────────── */}
            <aside
                className={cn(
                    "md:hidden fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50 bg-gray-50 shadow-2xl",
                    "flex flex-col overflow-y-auto custom-scrollbar",
                    "transition-transform duration-300 ease-in-out",
                    rightOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Close button */}
                <div className="flex justify-end p-4 sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                    <button
                        onClick={() => setRightOpen(false)}
                        aria-label="Cerrar panel"
                        className="size-9 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <X className="size-5 text-gray-600" />
                    </button>
                </div>

                {/* Profile section */}
                <section className="flex flex-col pb-8">
                    <div className="h-24 w-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-b-none" />
                    <div className="relative flex px-6">
                        <div className="flex-center absolute -top-10 size-20 rounded-full border-4 border-white bg-gray-200 shadow-lg flex items-center justify-center text-2xl font-bold text-gray-500 overflow-hidden">
                            {user.firstName[0]}
                        </div>
                        <div className="flex flex-col pt-12 gap-1">
                            <h1 className="text-lg font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-sm font-normal text-gray-600 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Banks section */}
                <section className="flex flex-col gap-6 py-6 px-6 border-t border-gray-200">
                    <div className="flex w-full justify-between items-center">
                        <h2 className="text-base font-semibold text-gray-900">Mis Bancos</h2>
                        {banks.length > 0 && (
                            <Link
                                href="/connect-bank"
                                onClick={closeAll}
                                className="flex gap-1.5 items-center text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                <span className="text-lg font-bold">+</span>
                                <span>Agregar</span>
                            </Link>
                        )}
                    </div>

                    {banks.length > 0 ? (
                        <BankStack banks={banks} user={user} />
                    ) : (
                        <Link
                            href="/connect-bank"
                            onClick={closeAll}
                            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                        >
                            <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <span className="text-2xl font-bold text-blue-500">+</span>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Conectar banco</p>
                                <p className="text-xs text-gray-400 mt-0.5">Vincula tu cuenta para ver tus tarjetas</p>
                            </div>
                        </Link>
                    )}
                </section>

                {/* Budgets section */}
                <section className="flex flex-col gap-4 py-6 px-6 border-t border-gray-200">
                    <h2 className="text-base font-semibold text-gray-900">Mis Presupuestos</h2>

                    {/* Budget 1 */}
                    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-red-100 flex items-center justify-center text-base">🍔</div>
                                <span className="font-semibold text-gray-700 text-sm">Comida</span>
                            </div>
                            <span className="text-red-500 font-bold text-xs">$120 left</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '70%' }} />
                        </div>
                    </div>

                    {/* Budget 2 */}
                    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-green-100 flex items-center justify-center text-base">💰</div>
                                <span className="font-semibold text-gray-700 text-sm">Ahorro</span>
                            </div>
                            <span className="text-green-500 font-bold text-xs">$50 left</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }} />
                        </div>
                    </div>
                </section>
            </aside>
        </>
    )
}

export default MobileNav
