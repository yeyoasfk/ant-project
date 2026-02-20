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
    <div className="relative h-32 sm:h-40 md:h-48 w-full flex items-center justify-center cursor-pointer group" onClick={toggleCard}>
      
      {/* Tarjeta 1 (Azul) */}
      <div 
        className={cn(
            "absolute transition-all duration-500 ease-out w-full max-w-sm",
            activeIndex === 0 
                ? "z-10 top-0 scale-100 opacity-100" 
                : "z-0 top-[-4 sm:-8 md:-10] scale-90 opacity-60 translate-x-2 sm:translate-x-3" 
        )}
      >
        <BankCard 
            account={banks[0]} 
            userName={`${user.firstName} ${user.lastName}`} 
            color="blue"
            isLink={false}
        />
      </div>

      {/* Tarjeta 2 (Morada) */}
      {banks[1] && (
          <div 
            className={cn(
                "absolute transition-all duration-500 ease-out w-full max-w-sm",
                activeIndex === 1 
                    ? "z-10 top-0 scale-100 opacity-100" 
                    : "z-0 top-[-4 sm:-8 md:-10] scale-90 opacity-60 translate-x-2 sm:translate-x-3"
            )}
          >
            <BankCard 
                account={banks[1]} 
                userName={`${user.firstName} ${user.lastName}`} 
                color="purple"
                isLink={false}
            />
          </div>
      )}
    </div>
  )
}

export default BankStack