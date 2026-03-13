/**
 * Analysis Skeleton
 * Muestra un estado de carga elegante para la página de análisis
 * Con enfoque en un gráfico dona circular animado (matching tema Hormiga)
 */

export default function AnalysisSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8 px-5 py-7 lg:py-12 min-h-screen">
      {/* HeaderBox Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-8 w-96 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-full max-w-2xl bg-white/5 rounded animate-pulse" />
      </div>

      <div className="flex flex-col gap-6 max-w-5xl">
        {/* 1. AntExpenseSummary Skeleton */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1f1019]/60 to-[#2a1436]/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <div className="space-y-4">
            <div className="h-5 w-56 bg-white/10 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 w-full max-w-lg bg-white/10 rounded animate-pulse" />
              <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* 2. MiniBankDropdown Skeleton */}
        <div className="h-12 w-full max-w-sm bg-white/10 rounded-xl border border-white/10 animate-pulse" />

        {/* 3. Gráfico Dona - CIRCULAR SKELETON */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1f1019]/60 to-[#2a1436]/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Título del gráfico */}
            <div className="space-y-2">
              <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-80 bg-white/5 rounded animate-pulse" />
            </div>

            {/* Gráfico Dona - Círculo Grande Animado */}
            <div className="flex justify-center py-8">
              <div className="relative w-64 h-64">
                {/* Círculo externo (outer ring) */}
                <div className="absolute inset-0 rounded-full border-8 border-transparent bg-gradient-to-br from-[#9333ea]/20 via-[#653584]/20 to-[#572371]/20 animate-pulse" />
                
                {/* Círculo medio (simulating donut) */}
                <div className="absolute inset-6 rounded-full border-6 border-transparent bg-gradient-to-br from-[#9d6dc0]/30 via-[#7a429e]/30 to-[#5a1f7a]/30 animate-pulse [animation-delay:0.1s]" />
                
                {/* Centro vacío (the donut hole) */}
                <div className="absolute inset-16 rounded-full bg-[#0a0608] border border-white/10" />
                
                {/* Pulse ring en el perímetro */}
                <div className="absolute inset-2 rounded-full border border-white/5 animate-pulse" />
              </div>
            </div>

            {/* Leyenda / Placeholders de categorías */}
            <div className="space-y-2 mt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {/* Color dot */}
                    <div className="w-3 h-3 rounded-full bg-white/20 animate-pulse" />
                    {/* Nombre categoría */}
                    <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
                  </div>
                  {/* Monto */}
                  <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
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
          <p className="text-sm text-gray-400 font-medium">Analizando tus gastos...</p>
        </div>
      </div>
    </div>
  );
}
