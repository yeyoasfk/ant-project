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
            <header className="md:hidden flex justify-between items-center px-4 py-3 border-b border-white/10 bg-[#1f1019]/80 backdrop-blur-xl sticky top-0 z-40 min-h-[60px] shadow-[0_1px_0_rgba(101,53,132,0.2)]">

                {/* Hamburger button */}
                <button
                    onClick={() => setNavOpen(true)}
                    aria-label="Abrir menú"
                    className="flex items-center justify-center size-10 rounded-xl bg-white/5 hover:bg-[#572371]/30 border border-white/10 hover:border-[#572371]/60 transition-all"
                >
                    <Menu className="size-5 text-gray-300" />
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
                    <span className="font-bold text-white text-base font-ibm-plex-serif tracking-wide">
                        HORMIGA
                    </span>
                </Link>

                {/* Right panel trigger – avatar button */}
                <button
                    onClick={() => setRightOpen(true)}
                    aria-label="Ver perfil y bancos"
                    className="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-[#3b174d] to-[#653584] hover:shadow-glow-purple border border-[#572371]/60 transition-all"
                >
                    <span className="text-sm font-bold text-white">
                        {user.firstName[0]}
                    </span>
                </button>
            </header>

            {/* ── Backdrop ─────────────────────────────────────────────────── */}
            {(navOpen || rightOpen) && (
                <div
                    className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={closeAll}
                />
            )}

            {/* ── LEFT Drawer – Navigation ──────────────────────────────────── */}
            <aside
                className={cn(
                    "md:hidden fixed top-0 left-0 h-full w-72 max-w-[85vw] z-50",
                    "bg-[#1f1019]/95 backdrop-blur-xl border-r border-white/10",
                    "shadow-[4px_0_30px_rgba(87,35,113,0.3)]",
                    "flex flex-col justify-between pt-6 px-4 pb-4",
                    "transition-transform duration-300 ease-in-out",
                    navOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header inside drawer */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="flex items-center gap-2.5" onClick={closeAll}>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b174d] to-[#653584] shadow-glow-purple">
                                <Image
                                    src="/icons/logo.png"
                                    width={22}
                                    height={22}
                                    alt="Hormiga logo"
                                />
                            </div>
                            <span className="text-lg font-bold font-ibm-plex-serif text-white tracking-wide">
                                Hormiga
                            </span>
                        </Link>
                        <button
                            onClick={() => setNavOpen(false)}
                            aria-label="Cerrar menú"
                            className="size-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                        >
                            <X className="size-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Nav links */}
                    <nav className="flex flex-col gap-1.5">
                        {sidebarLinks.map((item) => (
                            <Link
                                key={item.label}
                                href={item.route}
                                onClick={closeAll}
                                className="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-[#572371]/30 hover:border-[#572371]/60 hover:shadow-[0_0_16px_rgba(101,53,132,0.3)] border border-transparent transition-all duration-200"
                            >
                                <item.icon className="size-5 transition-all group-hover:drop-shadow-[0_0_6px_rgba(101,53,132,1)]" />
                                <span className="text-base font-semibold">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Footer with logout */}
                <div className="border-t border-white/10 pt-4">
                    <Footer user={user} type="mobile" />
                </div>
            </aside>

            {/* ── RIGHT Drawer – Profile & Banks ────────────────────────────── */}
            <aside
                className={cn(
                    "md:hidden fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50",
                    "bg-[#1f1019]/95 backdrop-blur-xl border-l border-white/10",
                    "shadow-[-4px_0_30px_rgba(87,35,113,0.3)]",
                    "flex flex-col overflow-y-auto custom-scrollbar",
                    "transition-transform duration-300 ease-in-out",
                    rightOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Close button */}
                <div className="flex justify-end p-4 sticky top-0 bg-[#1f1019]/90 backdrop-blur-sm border-b border-white/10 z-10">
                    <button
                        onClick={() => setRightOpen(false)}
                        aria-label="Cerrar panel"
                        className="size-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                        <X className="size-5 text-gray-400" />
                    </button>
                </div>

                {/* Profile section */}
                <section className="flex flex-col pb-6">
                    {/* Header gradient banner */}
                    <div className="h-24 w-full bg-gradient-to-r from-[#3b174d] via-[#572371] to-[#653584]" />
                    <div className="relative flex px-6">
                        {/* Avatar circle */}
                        <div className="flex-center absolute -top-10 size-20 rounded-full border-4 border-[#1f1019] bg-gradient-to-br from-[#3b174d] to-[#653584] shadow-glow-purple flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                            {user.firstName[0]}
                        </div>
                        <div className="flex flex-col pt-12 gap-0.5">
                            <h1 className="text-lg font-semibold text-white">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-sm font-normal text-gray-400 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Banks section */}
                <section className="flex flex-col gap-6 py-6 px-6 border-t border-white/10">
                    <div className="flex w-full justify-between items-center">
                        <h2 className="text-base font-semibold text-white">Mis Bancos</h2>
                        {banks.length > 0 && (
                            <Link
                                href="/connect-bank"
                                onClick={closeAll}
                                className="flex gap-1.5 items-center text-sm font-semibold text-[#9d6dc0] hover:text-[#653584] transition-colors"
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
                            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed border-white/10 hover:border-[#572371]/60 hover:bg-[#572371]/10 transition-all group"
                        >
                            <div className="size-12 rounded-full bg-[#3b174d]/80 border border-[#572371]/40 flex items-center justify-center group-hover:shadow-glow-purple transition-all">
                                <span className="text-2xl font-bold text-[#9d6dc0]">+</span>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-300 group-hover:text-[#9d6dc0] transition-colors">Conectar banco</p>
                                <p className="text-xs text-gray-500 mt-0.5">Vincula tu cuenta para ver tus tarjetas</p>
                            </div>
                        </Link>
                    )}
                </section>

                {/* Budgets section */}
                <section className="flex flex-col gap-4 py-6 px-6 border-t border-white/10">
                    <h2 className="text-base font-semibold text-white">Mis Presupuestos</h2>

                    {/* Budget 1 */}
                    <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-red-900/40 border border-red-700/40 flex items-center justify-center text-base">🍔</div>
                                <span className="font-semibold text-gray-200 text-sm">Comida</span>
                            </div>
                            <span className="text-red-400 font-bold text-xs">$120 left</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full" style={{ width: '70%' }} />
                        </div>
                    </div>

                    {/* Budget 2 */}
                    <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-green-900/40 border border-green-700/40 flex items-center justify-center text-base">💰</div>
                                <span className="font-semibold text-gray-200 text-sm">Ahorro</span>
                            </div>
                            <span className="text-green-400 font-bold text-xs">$50 left</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full" style={{ width: '90%' }} />
                        </div>
                    </div>
                </section>
            </aside>
        </>
    )
}

export default MobileNav
