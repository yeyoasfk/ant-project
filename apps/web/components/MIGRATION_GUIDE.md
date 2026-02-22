# 🛠️ Guía de Migración & Implementación Paso a Paso

## 📋 Tabla de Contenidos

1. [Componentes Actualizados](#componentes-actualizados)
2. [Cómo Migrar Nuevos Componentes](#cómo-migrar-nuevos-componentes)
3. [Ejemplos Prácticos](#ejemplos-prácticos)
4. [Troubleshooting](#troubleshooting)

---

## ✅ Componentes Actualizados

### Ya Funcionan con GlassContainer

| Componente | Variante | Tamaño | Estado |
|-----------|----------|--------|--------|
| CategoryDashboard | default | Mixto | ✅ Listo |
| AntExpenseChart | default | lg | ✅ Listo |
| AntExpenseSummary | default | md | ✅ Listo |
| IncomeExpenseChart | default | lg | ✅ Listo |
| RecentTransactions | default | md | ✅ Listo |
| TransactionsTable | default | lg | ✅ Listo |

---

## 🔄 Cómo Migrar Nuevos Componentes

### Paso 1: Identificar Contenedor Principal

Si tu componente tiene esta estructura:

```tsx
<div className="rounded-2xl border border-white/10 bg-[#1f1019]/60 p-6">
  {/* contenido */}
</div>
```

### Paso 2: Simular la Estructura Maestra

Si necesita el glow neón:

```tsx
<div className="relative group w-full">
  <div className="absolute -inset-[2px] rounded-2xl... bg-gradient-to-br from-fuchsia-600..." />
  <div className="relative rounded-2xl... bg-[#110916]/90...">
    {/* contenido */}
  </div>
</div>
```

### Paso 3: Reemplazar con GlassContainer

```tsx
// ANTES
<div className="relative group w-full">
  <div className="absolute -inset-[2px] rounded-2xl..." />
  <div className="relative rounded-2xl...">
    {/* contenido */}
  </div>
</div>

// DESPUÉS
import GlassContainer from './GlassContainer';

<GlassContainer>
  {/* contenido */}
</GlassContainer>
```

### Paso 4: Ajustar Props Según Necesidad

```tsx
// Si necesita tamaño diferente
<GlassContainer size="lg">

// Si necesita variante de color
<GlassContainer variant="warning">

// Si necesita clases adicionales
<GlassContainer className="max-w-md mx-auto">

// Combinado
<GlassContainer 
  variant="success"
  size="sm"
  className="shadow-lg"
  id="my-container"
  data-testid="success-box"
>
```

---

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Componente de Alertas Simple

```tsx
// ❌ ANTES (25 líneas, estructura repetida)
export function AlertBox() {
  return (
    <div className="relative group w-full">
      <div
        className="absolute -inset-[2px] rounded-2xl md:rounded-3xl 
          bg-gradient-to-br from-red-600 via-[#dc2626] to-transparent 
          opacity-50 blur-sm group-hover:opacity-100 
          transition-all duration-500 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-4 rounded-2xl md:rounded-3xl 
        bg-[#110916]/90 backdrop-blur-2xl border border-white/10 
        shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] h-full p-6">
        <AlertTriangle className="size-6 text-red-400" />
        <p className="text-white">Algo salió mal</p>
      </div>
    </div>
  );
}

// ✅ DESPUÉS (5 líneas, uso de GlassContainer)
import GlassContainer from './GlassContainer';
import { AlertTriangle } from 'lucide-react';

export function AlertBox() {
  return (
    <GlassContainer variant="danger">
      <div className="flex items-center gap-3">
        <AlertTriangle className="size-6 text-red-400" />
        <p className="text-white">Algo salió mal</p>
      </div>
    </GlassContainer>
  );
}
```

### Ejemplo 2: Tarjeta de Resumen con Diferentes Estados

```tsx
import GlassContainer from './GlassContainer';

// Componente que cambia de variante según estado
export function StatusCard({ status }: { status: 'pending' | 'success' | 'error' }) {
  const variantMap = {
    pending: 'info',
    success: 'success',
    error: 'danger'
  } as const;

  const messageMap = {
    pending: 'Procesando...',
    success: 'Completado',
    error: 'Error'
  };

  return (
    <GlassContainer 
      variant={variantMap[status]}
      size="sm"
      className="w-full md:max-w-sm"
    >
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          status === 'pending' ? 'bg-blue-400 animate-pulse' :
          status === 'success' ? 'bg-emerald-400' :
          'bg-red-400'
        }`} />
        <span className="text-gray-300 font-medium">
          {messageMap[status]}
        </span>
      </div>
    </GlassContainer>
  );
}

// Uso:
<StatusCard status="pending" />  {/* Info (azul) */}
<StatusCard status="success" />  {/* Success (verde) */}
<StatusCard status="error" />    {/* Danger (rojo) */}
```

### Ejemplo 3: Galería de Tarjetas con GlassContainer

```tsx
import GlassContainer from './GlassContainer';

export function CardGallery() {
  const items = [
    { id: 1, title: 'Tarjeta 1', variant: 'default' as const },
    { id: 2, title: 'Tarjeta 2', variant: 'success' as const },
    { id: 3, title: 'Tarjeta 3', variant: 'warning' as const }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map(item => (
        <GlassContainer
          key={item.id}
          variant={item.variant}
          size="md"
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <h3 className="text-lg font-bold text-white">{item.title}</h3>
          <p className="text-sm text-gray-400 mt-2">
            Descripción de la tarjeta
          </p>
        </GlassContainer>
      ))}
    </div>
  );
}
```

### Ejemplo 4: Modal/Dialog con GlassContainer

```tsx
import GlassContainer from './GlassContainer';
import { X } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <GlassContainer variant="warning" size="lg" className="max-w-md">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white">¿Estás seguro?</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="size-5 text-gray-400" />
          </button>
        </div>
        
        <p className="text-gray-300 mb-6">
          Esta acción no se puede deshacer
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white transition-colors"
          >
            Continuar
          </button>
        </div>
      </GlassContainer>
    </div>
  );
}
```

### Ejemplo 5: Dashboard Grid Mixto

```tsx
import GlassContainer from './GlassContainer';

export function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Grande - Gráfico Principal */}
      <GlassContainer 
        variant="default"
        size="lg" 
        className="md:col-span-2 lg:col-span-2 min-h-[400px]"
      >
        <h2 className="text-xl font-bold text-white mb-4">Gráfico Principal</h2>
        {/* ChartComponent */}
      </GlassContainer>

      {/* Sidebar - Resumen */}
      <GlassContainer 
        variant="info"
        size="md"
        className="md:col-span-1"
      >
        <h3 className="text-lg font-bold text-white mb-4">Resumen</h3>
        {/* SummaryContent */}
      </GlassContainer>

      {/* Fila inferior - Tres tarjetas */}
      {[1, 2, 3].map(i => (
        <GlassContainer
          key={i}
          variant={i === 1 ? 'success' : i === 2 ? 'warning' : 'danger'}
          size="sm"
        >
          <p className="text-white font-semibold">Métrica {i}</p>
          <p className="text-2xl font-bold mt-2 text-gray-200">$12,345</p>
        </GlassContainer>
      ))}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Problema 1: El Glow no aparece

**Síntoma:** Solo ves el contenedor sin efecto neón en hover

**Causa:** Falta la clase `group` en el padre

**Solución:**
```tsx
// ❌ Incorrecto
<div>
  <GlassContainer>Contenido</GlassContainer>
</div>

// ✅ Correcto (GlassContainer ya tiene group internamente)
<GlassContainer>Contenido</GlassContainer>
```

### Problema 2: Padding inconsistente

**Síntoma:** El contenido dentro tiene espacios irregulares

**Causa:** Mezcla de padding manual + prop size

**Solución:**
```tsx
// ❌ Incorrecto
<GlassContainer size="lg" className="p-8">
  Contenido
</GlassContainer>

// ✅ Correcto (usa size o className, no ambos)
<GlassContainer size="lg">
  Contenido
</GlassContainer>
```

### Problema 3: Variante no refleja cambios

**Síntoma:** Cambias variant pero el color no actualiza

**Causa:** TypeScript/IntelliSense desecho

**Solución:**
```tsx
// Limpia cache y reinicia:
// 1. En VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
// 2. Recarga el navegador
// 3. Verifica que importes GlassContainer correctamente
```

### Problema 4: Blur se ve demasiado suave/fuerte

**Síntoma:** El glow neón no es lo suficientemente visible

**Causa:** Necesitas ajustar opacity

**Solución:**
```tsx
// Aumentar visibilidad en GlassContainer.tsx línea 48:
// Cambia opacity-50 a opacity-70
className={`absolute -inset-[2px] rounded-2xl md:rounded-3xl 
  bg-gradient-to-br ${colors.from} ${colors.via} to-transparent 
  opacity-70 blur-xs // ← Aquí (era 50)
  group-hover:opacity-100`}
```

### Problema 5: Contenido NO se centra correctamente

**Síntoma:** El contenido interno está desalineado

**Causa:**  GlassContainer usa `flex flex-col`, asegúrate que eso sea lo que quieres

**Solución:**
```tsx
// Si necesitas grid en lugar de flex:
<GlassContainer className="p-0">
  <div className="grid grid-cols-2 gap-4 p-6">
    {/* Tu contenido en grid */}
  </div>
</GlassContainer>

// Si necesitas contenido sin padding automático:
<GlassContainer className="p-0">
  {/* Aquí tú manejas tu propio padding */}
</GlassContainer>
```

---

## ✨ Tips & Trucos

### Tip 1: Crear Variante Personalizada Rápido

```tsx
<GlassContainer 
  className="[&_div]:opacity-75 hover:[&_div]:opacity-100"
  variant="default"
>
  {/* Contenido con opacity dinámica */}
</GlassContainer>
```

### Tip 2: Animar Entrada con Tailwind

```tsx
<GlassContainer 
  className="animate-fadeIn"
  variant="success"
>
  {/* Entra suavemente */}
</GlassContainer>

// En tu tailwind.config.ts:
// animation: { fadeIn: 'fadeIn 0.5s ease-in' }
```

### Tip 3: Responder a Theme Changes

```tsx
<GlassContainer 
  variant={isDarkMode ? 'default' : 'info'}
  size={isMobile ? 'sm' : 'lg'}
>
  {/* Adapta variante y tamaño según dispositivo/tema */}
</GlassContainer>
```

### Tip 4: Skip el Glow en Ciertos Contextos

```tsx
<GlassContainer className="group-hover:opacity-100 [&>div:first-child]:hidden">
  {/* Oculta el glow pero mantiene el fondo */}
</GlassContainer>
```

---

## 🚀 Checklist de Implementación

- [ ] He importado GlassContainer en mi componente
- [ ] He reemplazado la estructura maestra con `<GlassContainer>`
- [ ] He elegido la variante correcta (default, success, danger, warning, info)
- [ ] He seleccionado el tamaño adecuado (sm, md, lg)
- [ ] He probado en móvil y desktop
- [ ] He verificado que el glow aparece en hover
- [ ] He comprobado que el contenido se ve bien
- [ ] He ejecutado `npm run build` sin errores

---

## 📞 Soporte & Preguntas

Si tienes preguntas sobre:
- **Variantes:** Ver [GLASSCONTAINER_REFERENCE.md](./GLASSCONTAINER_REFERENCE.md)
- **Performance:** Ver [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)
- **Ejemplos:** Mira [GlassContainerVariants.tsx](./GlassContainerVariants.tsx)

---

**Última actualización:** Feb 21, 2026  
**Versión:** 1.0  
**Status:** Production Ready ✅
