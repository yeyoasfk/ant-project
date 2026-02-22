import { ReactNode } from 'react';

interface GlassContainerProps {
  children: ReactNode;
  // Variantes de color
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  // Tamaño del contenedor
  size?: 'sm' | 'md' | 'lg';
  // Padding personalizado
  className?: string;
  // Props HTML adicionales
  [key: string]: any;
}

/**
 * GlassContainer Reutilizable
 * Componente que envuelve contenido con la estructura maestra de doble capa:
 * - Capa 1: Glow neón que se activa en hover
 * - Capa 2: Contenido acrílico oscuro con profundidad
 * 
 * Variantes de color:
 * - default: Púrpura (fuchsia-600 → #9333ea)
 * - success: Verde (emerald-600 → #10b981)
 * - danger: Rojo (red-600 → #dc2626)
 * - warning: Ámbar (amber-600 → #d97706)
 * - info: Azul (blue-600 → #2563eb)
 */
export default function GlassContainer({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: GlassContainerProps) {
  
  // 🎨 Mapeo de colores por variante
  const colorMap = {
    default: {
      from: 'from-fuchsia-600',
      via: 'via-[#9333ea]',
      glow: '[0_0_20px_rgba(147,51,234,0.4)]'
    },
    success: {
      from: 'from-emerald-600',
      via: 'via-[#10b981]',
      glow: '[0_0_20px_rgba(16,185,129,0.4)]'
    },
    danger: {
      from: 'from-red-600',
      via: 'via-[#dc2626]',
      glow: '[0_0_20px_rgba(220,38,38,0.4)]'
    },
    warning: {
      from: 'from-amber-600',
      via: 'via-[#d97706]',
      glow: '[0_0_20px_rgba(217,119,6,0.4)]'
    },
    info: {
      from: 'from-blue-600',
      via: 'via-[#2563eb]',
      glow: '[0_0_20px_rgba(37,99,235,0.4)]'
    }
  };

  // 📐 Mapeo de paddings por tamaño
  const sizeMap = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const colors = colorMap[variant];
  const padding = sizeMap[size];

  return (
    <div className="relative group w-full" {...props}>
      {/* ✨ CAPA 1: GLOW NEÓN (Se intensifica en hover) */}
      <div
        className={`absolute -inset-[2px] rounded-2xl md:rounded-3xl 
          bg-gradient-to-br ${colors.from} ${colors.via} to-transparent 
          opacity-50 blur-xs group-hover:opacity-100 
          transition-opacity duration-500 pointer-events-none`}
        aria-hidden="true"
      />
      
      {/* 🎨 CAPA 2: CONTENIDO ACRÍLICO OSCURO */}
      <div 
        className={`relative flex flex-col gap-4 rounded-2xl md:rounded-3xl 
          bg-[#110916]/90 backdrop-blur-2xl 
          border border-white/10 
          shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] 
          h-full ${padding} 
          transition-all duration-300 group-hover:border-white/20 
          ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
