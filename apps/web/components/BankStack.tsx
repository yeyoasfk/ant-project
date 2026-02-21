"use client"

import { useState } from 'react'
import BankCard from './BankCard'
import { cn } from '../lib/utils'

const BankStack = ({ banks, user }: { banks: any[], user: any }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!banks || banks.length === 0) return null;

  const userName = `${user.firstName} ${user.lastName}`;

  const toggleCard = () => {
    if (banks.length > 1) {
      setActiveIndex((prev) => (prev === 0 ? 1 : 0));
    }
  };

  // Si sólo hay una tarjeta, la mostramos normal (sin apilar)
  if (banks.length === 1) {
    return (
      <div className="w-full">
        <BankCard
          account={banks[0]}
          userName={userName}
          color="blue"
          isLink={false}
        />
      </div>
    );
  }

  // ─── Layout de Tarjetas Apiladas con Click-to-Swap ──────────
  // activeIndex===0 → card[0] al frente (cristal), card[1] detrás (sólida)
  // activeIndex===1 → card[1] al frente (cristal), card[0] detrás (sólida)
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ height: 'calc(10rem + 1.75rem)' }}
      onClick={toggleCard}
      title="Click para cambiar de tarjeta"
    >

      {/* ── TARJETA 0 ── */}
      <div
        className={cn(
          "absolute inset-0 w-full transition-all duration-500 ease-out",
          activeIndex === 0
            ? "z-10 translate-x-0 translate-y-0 rotate-0 opacity-100"       // frente: cristal
            : "z-0 translate-x-4 translate-y-5 rotate-2 opacity-90"          // detrás: sólida+offset
        )}
      >
        <BankCard
          account={banks[0]}
          userName={userName}
          color="blue"
          isLink={false}
          showBalance={activeIndex === 0}
          isGlass={activeIndex === 0}
        />
      </div>

      {/* ── TARJETA 1 ── */}
      <div
        className={cn(
          "absolute inset-0 w-full transition-all duration-500 ease-out",
          activeIndex === 1
            ? "z-10 translate-x-0 translate-y-0 rotate-0 opacity-100"       // frente: cristal
            : "z-0 translate-x-4 translate-y-5 rotate-2 opacity-90"          // detrás: sólida+offset
        )}
      >
        <BankCard
          account={banks[1]}
          userName={userName}
          color="purple"
          isLink={false}
          showBalance={activeIndex === 1}
          isGlass={activeIndex === 1}
        />
      </div>

    </div>
  );
}

export default BankStack