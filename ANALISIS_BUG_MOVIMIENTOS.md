# 🐛 ANÁLISIS COMPLETO: Movimientos No Se Actualizan Después de Sincronización

## Resumen del Problema
- ✅ El saldo total de la tarjeta se actualiza hace ~1 hora
- ❌ Los movimientos NO se actualizan ni en home ni en historial
- 🚨 Hay una desconexión entre los datos del saldo y los datos de transacciones

---

## 🔍 CAUSAS RAÍZ IDENTIFICADAS

### 1️⃣ **PROBLEMA CRÍTICO: Límite de 100 movimientos sin paginación**
**Localización:** `apps/web/lib/actions/bank.actions.ts`

```typescript
// Línea en getAccountMovements():
const movementsUrl = `https://api.fintoc.com/v1/accounts/${accountId}/movements?link_token=${linkToken}&limit=100`
```

**El Problema:**
- Fintoc devuelve máximo 100 movimientos por defecto
- Los movimientos más antiguos pueden quedar fuera del rango
- Si hay más de 100 transacciones, los movimientos nuevos pueden no mostrarse
- **NO hay paginación implementada** para obtener más allá de los primeros 100

**Impacto:**
- Un usuario con historial largo nunca verá movimientos recientes si están fuera del top 100
- El saldo cambia (porque Fintoc lo actualiza en la cuenta), pero los movimientos no se reflejan

---

### 2️⃣ **PROBLEMA: Sincronización No Espera Respuesta de Fintoc**
**Localización:** `apps/web/components/SyncButton.tsx` y `apps/web/lib/actions/bank.actions.ts`

```typescript
// forceBankSync envía refresh_intent pero NO verifica su estado
export async function forceBankSync(linkToken: string) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': process.env.FINTOC_SECRET_KEY! }
  });
  // Solo devuelve el resultado inmediato, NO el estado de procesamiento
  return { success: true, data };
}
```

**El Problema:**
- El endpoint `/api/fintoc/refresh_intents` se activa pero es **asincrónico**
- Fintoc toma 1-3 minutos para procesar (según la documentación)
- El botón simplemente espera 2 minutos y recarga automáticamente
- **NO hay forma de verificar si Fintoc realmente terminó**

**Impacto:**
- La página se recarga antes de que Fintoc termine, mostrando datos viejos
- El usuario ve "Procesando" pero los datos no son frescos

---

### 3️⃣ **PROBLEMA: Ordenamiento de Movimientos Inconsistente**
**Localización:** `apps/web/app/(root)/page.tsx` línea 79

```typescript
// En page.tsx, los gastos globales sí se ordenan:
.sort((a, b) => b.date.getTime() - a.date.getTime());

// PERO en transaction-history/page.tsx, rawTransactions NO se ordenan
// Se mapean tal como vienen de Fintoc (probablemente ascendente)
filteredTransactions = rawTransactions.map((t: any) => ({...}));
// ⬆️ SIN SORT - Mostrará en el orden que Fintoc devuelva
```

**El Problema:**
- En transaction-history, los movimientos se muestran en el orden de Fintoc
- Si Fintoc devuelve ascendente (antiguos primero), verás primero movimientos viejos
- Los nuevos movimientos pueden estar al final, fuera de vista

**Impacto:**
- Parece que no hay movimientos nuevos porque están al final de la lista

---

### 4️⃣ **PROBLEMA: Caché de Next.js Podría Estar Sirviendo Datos Viejos**
**Localización:** `apps/web/app/(root)/page.tsx` y `transaction-history/page.tsx`

```typescript
// Ambas páginas tienen:
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Pero podría haber problemas con:
// 1. Browser cache (usuario no actualiza el navegador correctamente)
// 2. CDN cache si está usando Vercel
// 3. Cache del cliente en Next.js
```

**El Problema:**
- `revalidate = 0` debería deshabilitar caché, pero podría haber excepciones
- Si el navegador del usuario cachea la respuesta, verá datos viejos

**Impacto:**
- El usuario presiona "actualizar" pero ve la misma información

---

### 5️⃣ **PROBLEMA: Webhook No Está Actualizado en Tiempo Real**
**Localización:** `apps/web/app/api/webhooks/fintoc/route.ts`

```typescript
// El webhook SOLO se activa cuando Fintoc envía una notificación
// Si el webhook no está registrado correctamente o Fintoc no lo está llamando:
export async function POST(request: Request) {
  // Solo procesa transaction.created
  if (event !== 'transaction.created') {
    return NextResponse.json({ message: 'Evento ignorado' }, { status: 200 });
  }
  // ... guarda en DB
}
```

**El Problema:**
- El webhook depende de que Fintoc envíe notificaciones
- Si las notificaciones no están configuradas o fallan, no hay actualización
- Las transacciones nuevas nunca se guardan en la BD

**Impacto:**
- Aunque Fintoc traiga nuevos movimientos, el webhook no los procesa

---

### 6️⃣ **PROBLEMA: Desajuste entre Llamadas API**
**El Flujo Actual:**

1. `getDetailedAccounts()` → Obtiene saldo actual de `GET /accounts`
2. `getAccountMovements()` → Obtiene movimientos de `GET /accounts/{id}/movements`

**El Problema:**
- `GET /accounts` devuelve el saldo actual (se actualiza rápido)
- `GET /movements` devuelve las transacciones (se actualiza más lento o con paginación limitada)
- Si una nueva transacción sale de los primeros 100, no se verá
- Esto explica exactamente tu caso: **saldo actualizado hace 1 hora, pero movimientos no**

**Impacto:**
- El saldo y los movimientos están desincronizados eternamente

---

## 📊 Tabla Comparativa de Problemas

| Problema | Severidad | Afecta Home | Afecta Historial | Solución |
|----------|-----------|-----------|------------------|----------|
| Límite 100 movimientos | 🔴 CRÍTICA | ✅ Sí | ✅ Sí | Implementar paginación |
| Sincronización no verifica estado | 🔴 CRÍTICA | ✅ Sí | ✅ Sí | Polling de estado refresh_intent |
| Falta de ordenamiento | 🟡 MEDIA | ❌ No | ✅ Sí | Sort descendente en transaction-history |
| Caché de Next.js | 🟡 MEDIA | ✅ Sí | ✅ Sí | Validar headers Cache-Control |
| Webhook no registrado | 🔴 CRÍTICA | ✅ Sí | ✅ Sí | Validar webhook en Fintoc dashboard |
| API desincronizadas | 🔴 CRÍTICA | ✅ Sí | ✅ Sí | Sincronizar timestamps |

---

## ✅ SOLUCIONES RECOMENDADAS

### Solución 1: Implementar Paginación en getAccountMovements
```typescript
export async function getAccountMovements(
  linkToken: string, 
  accountId: string,
  limit: number = 500  // Aumentar de 100 a 500
) {
  // Obtener más movimientos para cubrir más historia
}
```

### Solución 2: Agregar Polling para Verificar Estado de Refresh
```typescript
export async function checkRefreshStatus(linkToken: string) {
  // Llamar GET /refresh_intents para verificar estado
  // Devolver cuando status === 'completed'
}
```

### Solución 3: Ordenar Movimientos en transaction-history
```typescript
// En transaction-history/page.tsx
filteredTransactions = rawTransactions
  .map((t: any) => ({...}))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
```

### Solución 4: Revisar Caché Headers
```typescript
// En las páginas, asegurar headers correctos:
headers: {
  'Cache-Control': 'no-store, must-revalidate'
}
```

### Solución 5: Validar Webhook en Dashboard Fintoc
- Ir a https://dashboard.fintoc.com
- Verificar que el webhook esté registrado para `transaction.created`
- Verificar que la URL sea correcta
- Revisar logs de entregas

### Solución 6: Sincronizar Datos por Timestamp
```typescript
// Guardar timestamp de última sincronización
// Usar para filtrar solo movimientos nuevos desde esa fecha
```

---

## 🎯 PRIMER PASO (Crítico)
**Aumentar límite de movimientos a 500** en lugar de 100
```typescript
// bank.actions.ts, línea ~130
const movementsUrl = `https://api.fintoc.com/v1/accounts/${account.id}/movements?link_token=${linkToken}&limit=500`;
```

Esto debería resolver tu problema inmediatamente: permitirá ver más movimientos históricos.

---

## 📋 Checklist de Verificación
- [ ] ¿Tienes más de 100 transacciones en la cuenta?
- [ ] ¿El webhook está registrado en Fintoc dashboard?
- [ ] ¿Las notificaciones de webhook están habilitadas?
- [ ] ¿Tuviste que esperar los 2 minutos después de sincronizar?
- [ ] ¿Hiciste hard refresh en el navegador (Ctrl+Shift+R)?
- [ ] ¿La fecha del nuevo movimiento está correcta en Fintoc?

---

## 🚀 Próximos Pasos
1. Implementar paginación completa
2. Agregar estado real de sincronización
3. Guardar timestamp de última sincronización
4. Crear endpoint de debugging para verificar estado de Fintoc
