"use client"

import { useRouter } from 'next/navigation';
import { formatAmount } from '@/lib/utils';
import { useState, useRef, useEffect, useCallback } from 'react';

export default function MiniBankDropdown({ accounts, currentAccountId }: { accounts: any[], currentAccountId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentAccount = accounts.find(a => a.fintocAccountId === currentAccountId) || accounts[0];
  if (!currentAccount) return null;

  const last4 = currentAccount.number?.slice(-4) || '****';

  const translateType = (type: string) => {
    const types: Record<string, string> = {
      'checking_account': 'Cta. Corriente',
      'sight_account': 'Cta. Vista',
      'credit_card': 'T. Crédito',
      'savings_account': 'Cta. Ahorro',
    };
    return types[type] || type.replace('_', ' ');
  };

  // Calcula posición del panel en coordenadas de viewport (fixed)
  const updatePanelPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left,
      minWidth: rect.width,
      zIndex: 9999,
    });
  }, []);

  const handleToggle = () => {
    if (!open) updatePanelPosition();
    setOpen(prev => !prev);
  };

  // Mantener posición anclada durante scroll
  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePanelPosition();
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open, updatePanelPosition]);

  // Cerrar al click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        panelRef.current && !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    setOpen(false);
    router.push(`/gastos-hormiga?id=${id}`);
  };

  return (
    <div className="bg-gradient-to-r from-[#3b174d] via-[#572371] to-[#653584] text-white rounded-xl p-3 md:px-5 md:py-3 flex flex-col md:flex-row justify-between items-start md:items-center shadow-creditCard border border-white/10 gap-3 w-full">

      <div className="flex flex-col w-full md:w-auto">

        {/* ── TRIGGER ── */}
        <button
          ref={triggerRef}
          onClick={handleToggle}
          className="flex items-center gap-2 w-full md:w-max bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#9d6dc0]/60 text-white rounded-lg px-3 py-1.5 cursor-pointer outline-none transition-all duration-200 backdrop-blur-md"
        >
          <div className="flex-shrink-0 size-6 rounded-md bg-[#572371]/60 border border-white/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
            </svg>
          </div>
          <span className="text-base font-bold truncate max-w-[12rem]">
            {currentAccount.institutionName}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg"
            className={`size-4 text-white/50 ml-1 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* ── PANEL DESPLEGABLE — fixed para no moverse con el scroll ── */}
        {open && accounts.length > 1 && (
          <div
            ref={panelRef}
            style={panelStyle}
            className="bg-[#1f1019]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {accounts.map((acc) => {
              const isActive = acc.fintocAccountId === currentAccountId;
              return (
                <button
                  key={acc.fintocAccountId}
                  onClick={() => handleSelect(acc.fintocAccountId)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors duration-150
                    ${isActive ? 'bg-[#572371]/50 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  <div className={`flex-shrink-0 size-6 rounded-md border flex items-center justify-center
                    ${isActive ? 'bg-[#572371]/80 border-[#9d6dc0]/60' : 'bg-white/5 border-white/15'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`size-3.5 ${isActive ? 'text-[#c084fc]' : 'text-white/40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-tight">{acc.institutionName}</span>
                    <span className="text-xs text-white/45">{acc.name}</span>
                  </div>
                  {isActive && <div className="ml-auto flex-shrink-0 size-1.5 rounded-full bg-[#c084fc]" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Detalles cuenta */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="bg-white/15 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border border-white/10">
            {translateType(currentAccount.type)}
          </span>
          <span className="text-white/55 text-xs font-mono tracking-widest">•••• {last4}</span>
        </div>
      </div>

      {/* Saldo */}
      <div className="flex flex-col items-start md:items-end bg-black/15 px-4 py-1.5 rounded-lg border border-white/10 w-full md:w-auto shrink-0">
        <p className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">Saldo Actual</p>
        <p className="text-base font-bold">{formatAmount(currentAccount.currentBalance)}</p>
      </div>
    </div>
  );
}