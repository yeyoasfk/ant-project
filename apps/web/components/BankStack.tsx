"use client"

import { useState } from 'react'
import BankCard from './BankCard'
import { cn } from '../lib/utils'

const BankStack = ({ banks, user }: { banks: any[], user: any }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!banks || banks.length === 0) return null;

  const toggleCard = () => {
    if (banks.length > 1) {
      setActiveIndex((prev) => (prev === 0 ? 1 : 0));
    }
  };

  return (
    <div className="relative h-[220px] w-full flex items-center justify-center cursor-pointer group" onClick={toggleCard}>
      
      {/* Tarjeta 1 (Azul) */}
      <div 
        className={cn(
            "absolute transition-all duration-500 ease-out w-full max-w-[320px]",
            activeIndex === 0 
                ? "z-10 top-0 scale-100 opacity-100" 
                : "z-0 top-[-30px] scale-[0.85] opacity-60 translate-x-[15px]" 
        )}
      >
        <BankCard 
            account={banks[0]} 
            userName={`${user.firstName} ${user.lastName}`} 
            color="blue"
            isLink={false} // 👈 ¡ESTO EVITA LA NAVEGACIÓN Y PERMITE LA ANIMACIÓN!
        />
      </div>

      {/* Tarjeta 2 (Morada) */}
      {banks[1] && (
          <div 
            className={cn(
                "absolute transition-all duration-500 ease-out w-full max-w-[320px]",
                activeIndex === 1 
                    ? "z-10 top-0 scale-100 opacity-100" 
                    : "z-0 top-[-30px] scale-[0.85] opacity-60 translate-x-[15px]"
            )}
          >
            <BankCard 
                account={banks[1]} 
                userName={`${user.firstName} ${user.lastName}`} 
                color="purple"
                isLink={false} // 👈 ¡AQUÍ TAMBIÉN!
            />
          </div>
      )}
    </div>
  )
}

export default BankStack