'use client'

import GlassContainer from './GlassContainer';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * GlassContainerVariants - Showcase de todas las variantes de colores
 * Útil para referencia visual y testing de estilos
 */
export default function GlassContainerVariants() {
  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* VARIANTE DEFAULT (Púrpura) */}
      <GlassContainer variant="default">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#3b174d]/80 border border-[#572371]/40">
            <div className="size-5 rounded-full bg-gradient-to-br from-fuchsia-600 to-[#9333ea]" />
          </div>
          <div>
            <h3 className="text-16 font-bold text-white">Variante Default (Púrpura)</h3>
            <p className="text-13 text-gray-400">Glow fuchsia-600 → #9333ea. Ideal para contenido principal.</p>
          </div>
        </div>
      </GlassContainer>

      {/* VARIANTE SUCCESS (Verde) */}
      <GlassContainer variant="success">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-900/40 border border-emerald-700/40">
            <CheckCircle className="size-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-16 font-bold text-white">Variante Success (Verde)</h3>
            <p className="text-13 text-gray-400">Glow emerald-600 → #10b981. Para confirmaciones y datos positivos.</p>
          </div>
        </div>
      </GlassContainer>

      {/* VARIANTE DANGER (Rojo) */}
      <GlassContainer variant="danger">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-900/40 border border-red-700/40">
            <AlertCircle className="size-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-16 font-bold text-white">Variante Danger (Rojo)</h3>
            <p className="text-13 text-gray-400">Glow red-600 → #dc2626. Para alertas y valores críticos.</p>
          </div>
        </div>
      </GlassContainer>

      {/* VARIANTE WARNING (Ámbar) */}
      <GlassContainer variant="warning">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-900/40 border border-amber-700/40">
            <AlertTriangle className="size-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-16 font-bold text-white">Variante Warning (Ámbar)</h3>
            <p className="text-13 text-gray-400">Glow amber-600 → #d97706. Para advertencias y aproximaciones al límite.</p>
          </div>
        </div>
      </GlassContainer>

      {/* VARIANTE INFO (Azul) */}
      <GlassContainer variant="info">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-900/40 border border-blue-700/40">
            <Info className="size-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-16 font-bold text-white">Variante Info (Azul)</h3>
            <p className="text-13 text-gray-400">Glow blue-600 → #2563eb. Para información y contexto adicional.</p>
          </div>
        </div>
      </GlassContainer>

      {/* EJEMPLO CON DIFERENTES TAMAÑOS */}
      <div className="flex flex-col gap-4 mt-4">
        <h3 className="text-18 font-bold text-white">Tamaños Disponibles</h3>
        
        <GlassContainer size="sm">
          <p className="text-13 text-gray-300">Tamaño Small (p-3 sm:p-4)</p>
        </GlassContainer>

        <GlassContainer size="md">
          <p className="text-14 text-gray-300">Tamaño Medium (p-4 sm:p-6) - Default</p>
        </GlassContainer>

        <GlassContainer size="lg">
          <p className="text-15 text-gray-300">Tamaño Large (p-6 sm:p-8)</p>
        </GlassContainer>
      </div>
    </div>
  );
}
