/**
 * Dashboard Skeleton
 * Muestra un estado de carga elegante para el dashboard mientras se sincronizan datos con Fintoc
 */

export default function DashboardSkeleton() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 py-6 sm:py-8 overflow-y-auto">
      {/* HeaderBox Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-8 w-96 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-full max-w-2xl bg-white/5 rounded animate-pulse" />
      </div>

      {/* TotalBalanceBox Skeleton */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1f1019]/60 to-[#2a1436]/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="space-y-4">
          <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 p-4 rounded-xl bg-white/5">
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AntExpenseSummary Skeleton */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1f1019]/60 to-[#2a1436]/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="space-y-4">
          <div className="h-4 w-56 bg-white/10 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 space-y-2">
                <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
                <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RecentTransactions Skeleton */}
      <div className="rounded-2xl border border-white/10 bg-[#1f1019]/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
        <div className="space-y-4">
          <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
          
          {/* Tabs skeleton */}
          <div className="flex gap-2 border-b border-white/10 pb-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            ))}
          </div>

          {/* Transaction rows skeleton */}
          <div className="space-y-3 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="py-6 flex flex-col items-center justify-center gap-3">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-[#9333ea] rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-[#9333ea] rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-[#9333ea] rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Sincronizando tu dashboard...</p>
      </div>
    </div>
  );
}
