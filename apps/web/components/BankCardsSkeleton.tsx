/**
 * Bank Cards Skeleton
 * Muestra tarjetas de carga mientras Fintoc sincroniza los detalles de las cuentas
 */

export default function BankCardsSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
      {/* HeaderBox Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-96 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-full max-w-2xl bg-white/5 rounded animate-pulse" />
      </div>

      {/* Bank Accounts Section */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
        
        {/* Bank cards grid skeleton */}
        <div className="flex flex-wrap gap-6 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`bank-${i}`} className="flex flex-col gap-3 w-full sm:w-[320px]">
              {/* BankCard skeleton */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1f1019]/60 to-[#2a1436]/60 backdrop-blur-xl p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                  <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
                </div>
              </div>

              {/* AccountToggle skeleton */}
              <div className="h-10 w-full bg-white/10 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Credit Cards Section */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
        
        {/* Credit cards grid skeleton */}
        <div className="flex flex-wrap gap-6 mt-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`credit-${i}`} className="flex flex-col gap-3 w-full sm:w-[320px]">
              {/* BankCard skeleton */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1f1019]/60 to-[#2a1436]/60 backdrop-blur-xl p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                  <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
                </div>
              </div>

              {/* AccountToggle skeleton */}
              <div className="h-10 w-full bg-white/10 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="py-8 flex flex-col items-center justify-center gap-3">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-[#9333ea] rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-[#9333ea] rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-[#9333ea] rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Sincronizando tus cuentas...</p>
      </div>
    </div>
  );
}
