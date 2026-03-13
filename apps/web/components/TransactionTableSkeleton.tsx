/**
 * Skeleton loading state para la tabla de transacciones
 * Simula el layout de la tabla real con animación de carga
 */
export default function TransactionTableSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1f1019]/60 backdrop-blur-xl p-4 shadow-2xl">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <h2 className="text-18 font-bold text-white">Movimientos de la cuenta</h2>
        {/* Botón sync skeleton */}
        <div className="h-10 w-32 bg-gradient-to-r from-[#653584]/30 to-[#9333ea]/30 rounded-lg animate-pulse" />
      </div>

      {/* Tabla skeleton */}
      <div className="overflow-x-auto">
        {/* Header de la tabla */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-white/10 mb-3">
          <div className="col-span-3 h-4 bg-white/10 rounded animate-pulse" />
          <div className="col-span-2 h-4 bg-white/10 rounded animate-pulse" />
          <div className="col-span-2 h-4 bg-white/10 rounded animate-pulse" />
          <div className="col-span-3 h-4 bg-white/10 rounded animate-pulse" />
          <div className="col-span-2 h-4 bg-white/10 rounded animate-pulse" />
        </div>

        {/* Filas de esqueleto */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-3 px-4 py-4 border-b border-white/10 hover:bg-white/5 transition-colors"
          >
            <div className="col-span-3 h-4 bg-white/10 rounded animate-pulse" />
            <div className="col-span-2 h-4 bg-white/10 rounded animate-pulse" />
            <div className="col-span-2 h-4 bg-white/10 rounded animate-pulse" />
            <div className="col-span-3 h-4 bg-white/10 rounded animate-pulse" />
            <div className="col-span-2 h-4 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Loading indicator centered */}
      <div className="py-8 flex flex-col items-center justify-center gap-3">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-[#9333ea] rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-[#9333ea] rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-[#9333ea] rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Sincronizando tus movimientos...</p>
      </div>
    </div>
  );
}
