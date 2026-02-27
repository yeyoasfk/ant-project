"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Wallet,
    Bug,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import GlassContainer from './GlassContainer';
import { formatAmount } from '@/lib/utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
    Tooltip,
    Legend
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: string;
    categoryName: string;
    categoryColor: string;
    isAnt: boolean;
}

interface HormigaDashboardProps {
    totalCurrentBalance: number;
    accounts: any[];
    currentAccountId: string;
    transactions: Transaction[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ANT_BUDGET = 150000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function getInitial(text: string) {
    return (text || 'T').charAt(0).toUpperCase();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Bank dropdown that routes to /hormiga?id= */
function HormigaBankDropdown({
    accounts,
    currentAccountId,
}: {
    accounts: any[];
    currentAccountId: string;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

    const currentAccount =
        accounts.find((a) => a.fintocAccountId === currentAccountId) || accounts[0];
    if (!currentAccount) return null;

    const last4 = currentAccount.number?.slice(-4) || '****';
    const translateType = (type: string) => {
        const map: Record<string, string> = {
            checking_account: 'Cta. Corriente',
            sight_account: 'Cta. Vista',
            credit_card: 'T. Crédito',
            savings_account: 'Cta. Ahorro',
        };
        return map[type] || type.replace('_', ' ');
    };

    const updatePos = () => {
        if (!triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        setPanelStyle({ position: 'fixed', top: r.bottom + 8, left: r.left, minWidth: r.width, zIndex: 9999 });
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
                panelRef.current && !panelRef.current.contains(e.target as Node)
            ) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="bg-gradient-to-r from-[#3b174d] via-[#572371] to-[#653584] text-white rounded-xl p-3 md:px-5 md:py-3 flex flex-col md:flex-row justify-between items-start md:items-center border border-white/10 gap-3 w-full shadow-lg">
            <div className="flex flex-col w-full md:w-auto">
                {/* Trigger */}
                <button
                    ref={triggerRef}
                    onClick={() => { if (!open) updatePos(); setOpen(p => !p); }}
                    className="flex items-center gap-2 w-full md:w-max bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#9d6dc0]/60 rounded-lg px-3 py-1.5 text-white cursor-pointer outline-none transition-all duration-200 backdrop-blur-md"
                >
                    <div className="flex-shrink-0 size-6 rounded-md bg-[#572371]/60 border border-white/20 flex items-center justify-center">
                        <Bug className="size-3.5 text-[#c084fc]" />
                    </div>
                    <span className="text-base font-bold truncate max-w-[12rem]">{currentAccount.institutionName}</span>
                    <ChevronDown className={`size-4 text-white/50 ml-1 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown panel */}
                {open && (
                    <div ref={panelRef} style={panelStyle} className="bg-[#1f1019]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        {accounts.map((acc) => {
                            const isActive = acc.fintocAccountId === currentAccountId;
                            return (
                                <button
                                    key={acc.fintocAccountId}
                                    onClick={() => { setOpen(false); router.push(`/hormiga?id=${acc.fintocAccountId}`); }}
                                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors duration-150 ${isActive ? 'bg-[#572371]/50 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <div className={`flex-shrink-0 size-6 rounded-md border flex items-center justify-center ${isActive ? 'bg-[#572371]/80 border-[#9d6dc0]/60' : 'bg-white/5 border-white/15'}`}>
                                        <Bug className={`size-3.5 ${isActive ? 'text-[#c084fc]' : 'text-white/40'}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold leading-tight">{acc.institutionName}</span>
                                        <span className="text-xs text-white/45">{acc.name}</span>
                                    </div>
                                    {isActive && <div className="ml-auto size-1.5 rounded-full bg-[#c084fc]" />}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center gap-2 mt-1.5">
                    <span className="bg-white/15 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border border-white/10">
                        {translateType(currentAccount.type)}
                    </span>
                    <span className="text-white/55 text-xs font-mono tracking-widest">•••• {last4}</span>
                </div>
            </div>

            <div className="flex flex-col items-start md:items-end bg-black/15 px-4 py-1.5 rounded-lg border border-white/10 w-full md:w-auto shrink-0">
                <p className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">Saldo Actual</p>
                <p className="text-base font-bold">{formatAmount(currentAccount.currentBalance)}</p>
            </div>
        </div>
    );
}

/** Single KPI card */
function KPICard({
    label, value, icon: Icon, color, sub,
}: {
    label: string; value: number; icon: React.ElementType; color: string; sub?: string;
}) {
    return (
        <div className="relative group flex flex-col gap-2 rounded-2xl bg-[#1a0d23]/80 backdrop-blur-md border border-white/10 p-4 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_20px_rgba(101,53,132,0.25)]">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ backgroundColor: color }} />
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-xl border border-white/10" style={{ backgroundColor: `${color}33` }}>
                    <Icon className="size-4" style={{ color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatAmount(value)}</p>
            {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HormigaDashboard({
    totalCurrentBalance,
    accounts,
    currentAccountId,
    transactions,
}: HormigaDashboardProps) {

    // ── Carousel state ────────────────────────────────────────────────────────
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // ── Chart / table state ───────────────────────────────────────────────────
    const [lineTimeframe, setLineTimeframe] = useState<'semana' | 'mes'>('semana');
    const [selectedCategory, setSelectedCategory] = useState('TODAS');
    const [catDropdownOpen, setCatDropdownOpen] = useState(false);
    const catDropdownRef = useRef<HTMLDivElement>(null);

    // Close category dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
                setCatDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Date helpers ──────────────────────────────────────────────────────────
    const now = new Date();
    const firstDayOfMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), []);
    const prevFirstDay = useMemo(() => new Date(now.getFullYear(), now.getMonth() - 1, 1), []);
    const prevLastDay = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 0), []);

    // ── antExpenses: all ant transactions (full history) ──────────────────────
    const antExpenses = useMemo(() => transactions.filter((t) => t.isAnt), [transactions]);

    // ── antExpensesThisMonth: current month only (for KPIs + bar chart) ───────
    const antExpensesThisMonth = useMemo(
        () => antExpenses.filter((t) => new Date(t.date) >= firstDayOfMonth),
        [antExpenses, firstDayOfMonth]
    );

    // ── KPI values ────────────────────────────────────────────────────────────
    const hormigaGastado = useMemo(
        () => antExpensesThisMonth.reduce((acc, t) => acc + t.amount, 0),
        [antExpensesThisMonth]
    );
    const hormigaRestante = Math.max(ANT_BUDGET - hormigaGastado, 0);

    // ── Unique categories for Slide 1 filter dropdown ─────────────────────────
    const uniqueCategories = useMemo(() => {
        const cats = new Set(antExpensesThisMonth.map((t) => t.categoryName));
        return ['TODAS', ...Array.from(cats)];
    }, [antExpensesThisMonth]);

    // ── Line chart data ───────────────────────────────────────────────────────
    const lineChartData = useMemo(() => {
        if (lineTimeframe === 'semana') {
            const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            const currentData = new Array(7).fill(0);
            const prevData = new Array(7).fill(0);

            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

            antExpenses
                .filter((t) => new Date(t.date) >= oneWeekAgo)
                .forEach((t) => {
                    const idx = (new Date(t.date).getDay() + 6) % 7; // Mon=0
                    currentData[idx] = (currentData[idx] || 0) + t.amount;
                });

            antExpenses
                .filter((t) => new Date(t.date) >= twoWeeksAgo && new Date(t.date) < oneWeekAgo)
                .forEach((t) => {
                    const idx = (new Date(t.date).getDay() + 6) % 7;
                    prevData[idx] = (prevData[idx] || 0) + t.amount;
                });

            return { labels, currentData, prevData };
        } else {
            // mes: días 1–31
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const daysInPrevMonth = prevLastDay.getDate();
            const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
            const currentData = new Array(daysInMonth).fill(0);
            const prevData = new Array(daysInPrevMonth).fill(0);

            antExpenses
                .filter((t) => new Date(t.date) >= firstDayOfMonth)
                .forEach((t) => {
                    const day = new Date(t.date).getDate() - 1;
                    currentData[day] = (currentData[day] || 0) + t.amount;
                });

            antExpenses
                .filter((t) => new Date(t.date) >= prevFirstDay && new Date(t.date) <= prevLastDay)
                .forEach((t) => {
                    const day = new Date(t.date).getDate() - 1;
                    prevData[day] = (prevData[day] || 0) + t.amount;
                });

            return { labels, currentData, prevData };
        }
    }, [antExpenses, lineTimeframe, firstDayOfMonth, prevFirstDay, prevLastDay]);

    const lineData = {
        labels: lineChartData.labels,
        datasets: [
            {
                // ── Mes Actual: línea sólida, gruesa, violeta brillante ──
                label: 'Mes Actual',
                data: lineChartData.currentData,
                borderColor: '#a78bfa',
                backgroundColor: 'rgba(167,139,250,0.12)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: '#a78bfa',
                pointBorderColor: '#1a0d23',
                pointBorderWidth: 2,
                borderWidth: 3,
            },
            {
                // ── Mes Anterior: línea punteada, delgada, coral/naranja ──
                label: 'Mes Anterior',
                data: lineChartData.prevData,
                borderColor: '#fb923c',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#fb923c',
                pointBorderColor: '#1a0d23',
                pointBorderWidth: 1.5,
                borderWidth: 1.5,
                borderDash: [6, 4],
            },
        ],
    };

    const lineOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: { color: '#9ca3af', font: { size: 11 }, boxWidth: 12, usePointStyle: true },
            },
            tooltip: {
                backgroundColor: 'rgba(29,12,37,0.95)',
                borderColor: 'rgba(101,53,132,0.5)',
                borderWidth: 1,
                titleColor: '#e5e7eb',
                bodyColor: '#9ca3af',
                callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}` },
            },
        },
        scales: {
            y: {
                border: { display: false },
                grid: { color: 'rgba(255,255,255,0.05)', borderDash: [4, 4] },
                ticks: { color: '#6b7280', callback: (v: any) => formatAmount(v) },
            },
            x: {
                border: { display: false },
                grid: { display: false },
                ticks: { color: '#6b7280', font: { size: 10 } },
            },
        },
    };

    // ── Bar chart data ────────────────────────────────────────────────────────
    const barChartData = useMemo(() => {
        // Aggregate antExpenses of the current month by categoryName, sorted desc
        const catMap: Record<string, number> = {};
        antExpensesThisMonth.forEach((t) => {
            catMap[t.categoryName] = (catMap[t.categoryName] || 0) + t.amount;
        });

        const sorted = Object.entries(catMap).sort(([, a], [, b]) => b - a);

        return {
            labels: sorted.map(([cat]) => cat),
            datasets: [
                {
                    label: 'Total Gastado',
                    data: sorted.map(([, val]) => val),
                    backgroundColor: '#653584',
                    hoverBackgroundColor: '#9d6dc0',
                    borderRadius: 6,
                    barPercentage: 0.55,
                    categoryPercentage: 0.8,
                },
            ],
        };
    }, [antExpensesThisMonth]);

    const barOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(29,12,37,0.95)',
                borderColor: 'rgba(101,53,132,0.5)',
                borderWidth: 1,
                titleColor: '#e5e7eb',
                bodyColor: '#9ca3af',
                callbacks: { label: (ctx: any) => ` ${formatAmount(ctx.parsed.y)}` },
            },
        },
        scales: {
            y: {
                border: { display: false },
                grid: { color: 'rgba(255,255,255,0.05)', borderDash: [4, 4] },
                ticks: { color: '#6b7280', callback: (v: any) => formatAmount(v) },
            },
            x: {
                border: { display: false },
                grid: { display: false },
                ticks: { color: '#9ca3af', font: { size: 11 } },
            },
        },
    };

    // ── Table data — filtered by currentSlide + selectedCategory ─────────────
    const filteredTableData = useMemo(() => {
        if (currentSlide === 0) {
            // Slide 0: full ant expense history
            return antExpenses;
        }
        // Slide 1: current month, optionally filtered by category
        if (selectedCategory === 'TODAS') {
            return antExpensesThisMonth;
        }
        return antExpensesThisMonth.filter((t) => t.categoryName === selectedCategory);
    }, [currentSlide, antExpenses, antExpensesThisMonth, selectedCategory]);

    // ── Carousel navigation ───────────────────────────────────────────────────
    const goToSlide = (idx: number) => {
        setCurrentSlide(idx);
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ left: idx * scrollRef.current.clientWidth, behavior: 'smooth' });
        }
    };

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
        if (idx !== currentSlide) setCurrentSlide(idx);
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl">

            {/* ── KPI Grid ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                <KPICard label="Saldo Total" value={totalCurrentBalance} icon={Wallet} color="#9d6dc0" sub="Todas las cuentas" />
                <KPICard label="Saldo Hormiga" value={ANT_BUDGET} icon={Bug} color="#c084fc" sub="Presupuesto mensual" />
                <KPICard label="Hormiga Gastado" value={hormigaGastado} icon={TrendingDown} color="#f97316" sub="Este mes" />
                <KPICard label="Hormiga Restante" value={hormigaRestante} icon={TrendingUp} color="#22c55e" sub={`${Math.max(0, Math.round((hormigaRestante / ANT_BUDGET) * 100))}% disponible`} />
            </div>

            {/* ── Bank Selector (debajo de los KPIs) ───────────────────────────── */}
            <HormigaBankDropdown accounts={accounts} currentAccountId={currentAccountId} />

            {/* ── Chart Carousel ────────────────────────────────────────────────── */}
            <div className="relative">

                {/* ← Prev button (desktop only) */}
                {currentSlide > 0 && (
                    <button
                        onClick={() => goToSlide(0)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex items-center justify-center size-9 rounded-full bg-[#2d183b]/90 backdrop-blur-md border border-white/15 text-white hover:bg-[#572371]/50 transition-all duration-200 shadow-lg"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                )}

                {/* Slides container */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar flex gap-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* ─ Slide 0: Line chart ─ */}
                    <div className="w-full flex-shrink-0 snap-center">
                        <GlassContainer size="lg">
                            {/* Header + timeframe toggle */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <h2 className="text-16 font-bold text-white">Historial Hormiga</h2>
                                <div className="flex bg-[#2d183b]/80 backdrop-blur-sm p-0.5 rounded-lg border border-white/10">
                                    {(['semana', 'mes'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setLineTimeframe(t)}
                                            className={`px-4 py-1.5 rounded-md text-12 font-semibold capitalize transition-all duration-200 ${lineTimeframe === t
                                                ? 'bg-[#572371] text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-300'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Line chart */}
                            <div className="h-[240px] w-full">
                                <Line data={lineData as any} options={lineOptions} />
                            </div>
                        </GlassContainer>
                    </div>

                    {/* ─ Slide 1: Bar chart ─ */}
                    <div className="w-full flex-shrink-0 snap-center">
                        <GlassContainer size="lg">
                            <div className="mb-4">
                                <h2 className="text-16 font-bold text-white">Top Categorías</h2>
                                <p className="text-12 text-gray-500 mt-0.5">Gastos hormiga del mes por categoría</p>
                            </div>
                            {barChartData.labels.length > 0 ? (
                                <div className="h-[240px] w-full">
                                    <Bar data={barChartData as any} options={barOptions} />
                                </div>
                            ) : (
                                <div className="h-[240px] flex items-center justify-center text-gray-500 text-sm">
                                    Sin gastos hormiga este mes
                                </div>
                            )}
                        </GlassContainer>
                    </div>
                </div>

                {/* → Next button (desktop only) */}
                {currentSlide < 1 && (
                    <button
                        onClick={() => goToSlide(1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex items-center justify-center size-9 rounded-full bg-[#2d183b]/90 backdrop-blur-md border border-white/15 text-white hover:bg-[#572371]/50 transition-all duration-200 shadow-lg"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                )}

                {/* Dot indicators */}
                <div className="flex justify-center gap-2 mt-4">
                    {[0, 1].map((i) => (
                        <button
                            key={i}
                            onClick={() => goToSlide(i)}
                            aria-label={`Ir al slide ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${currentSlide === i
                                ? 'w-6 h-2 bg-[#9d6dc0]'
                                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* ── Table Section ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">

                {/* Title row + category dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Dynamic title */}
                    <h2 className="text-16 font-bold text-white">
                        {currentSlide === 0 ? 'Gastos Hormiga' : 'Categorías con Gastos Hormiga'}
                    </h2>

                    {/* Category filter — ONLY on Slide 1 */}
                    {currentSlide === 1 && (
                        <div className="relative" ref={catDropdownRef}>
                            {/* Dropdown trigger */}
                            <button
                                onClick={() => setCatDropdownOpen((prev) => !prev)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[#2d183b]/80 border border-white/10 rounded-lg text-sm text-white/80 hover:text-white hover:border-[#9d6dc0]/50 transition-all duration-200 min-w-[140px] justify-between"
                            >
                                <span className="font-medium truncate">{selectedCategory}</span>
                                <ChevronDown
                                    className={`size-4 text-white/40 flex-shrink-0 transition-transform duration-200 ${catDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown list */}
                            {catDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-[#1f1019]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                    {uniqueCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setCatDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${selectedCategory === cat
                                                ? 'bg-[#572371]/50 text-white font-semibold'
                                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Table */}
                <GlassContainer size="md" className="!p-0 overflow-hidden">
                    {/* Column headers */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-3 border-b border-white/5">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Transacción</span>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 hidden sm:block">Categoría</span>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 hidden sm:block">Fecha</span>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 text-right">Monto</span>
                    </div>

                    {/* Body — driven by filteredTableData */}
                    <div className="divide-y divide-white/5">
                        {filteredTableData.length === 0 ? (
                            <div className="px-4 py-10 text-center text-sm text-gray-500">
                                Sin gastos hormiga para mostrar
                            </div>
                        ) : (
                            filteredTableData.slice(0, 50).map((tx, idx) => (
                                <div
                                    key={tx.id || idx}
                                    className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-3 items-center hover:bg-white/[0.03] transition-colors duration-150"
                                >
                                    {/* Transacción */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className="flex-shrink-0 size-8 rounded-full flex items-center justify-center text-12 font-bold text-white"
                                            style={{
                                                backgroundColor: (tx.categoryColor || '#572371') + '55',
                                                border: `1.5px solid ${(tx.categoryColor || '#572371')}44`,
                                            }}
                                        >
                                            {getInitial(tx.description)}
                                        </div>
                                        <span className="text-sm text-white/85 font-medium truncate">{tx.description}</span>
                                    </div>

                                    {/* Categoría */}
                                    <span className="text-xs text-gray-400 hidden sm:block truncate">{tx.categoryName}</span>

                                    {/* Fecha */}
                                    <span className="text-xs text-gray-500 hidden sm:block">{formatDate(tx.date)}</span>

                                    {/* Monto */}
                                    <span className="text-sm font-bold text-white text-right">{formatAmount(tx.amount)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </GlassContainer>
            </div>
        </div>
    );
}
