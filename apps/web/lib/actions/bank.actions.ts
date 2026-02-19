"use server"

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { classifyAntExpense } from '../utils'

// 👇 PEGA TU LLAVE SECRETA AQUÍ ENTRE LAS COMILLAS (La que empieza con sk_live_)
// Esto es temporal para confirmar que la llave funciona.
const FINTOC_SECRET_KEY = process.env.FINTOC_SECRET_KEY!;

/**
 * 1. GUARDAR CUENTA EN SUPABASE
 */
export async function linkBankAccount({
  fintocId,
  institutionName,
  institutionId
}: {
  fintocId: string,
  institutionName: string,
  institutionId: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Usuario no autenticado")

  console.log("🔍 [Link] Procesando token recibido del widget");

  // 🚨 CORRECCIÓN CRÍTICA: SIEMPRE intercambiar el token.
  // Error Fintoc: "Link access tokens are in the format 'LINK_ID_token_LINK_ACCESS_TOKEN'"
  // El token "link_DQoGNWi2y5eOkdxy" es solo LINK_ID, NO el link_token completo.
  // Debemos SIEMPRE llamar al exchange para obtener el token en formato correcto.
  let finalToken: string;

  try {
    console.log("📡 [Exchange] Intercambiando token (obligatorio para API Fintoc)...");
    const exchangeResponse = await fetch(
      `https://api.fintoc.com/v1/links/exchange?exchange_token=${encodeURIComponent(fintocId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': FINTOC_SECRET_KEY,
          'Content-Type': 'application/json',
        }
      }
    );

    if (exchangeResponse.ok) {
      const data = await exchangeResponse.json();
      finalToken = data.link_token;
      if (!finalToken) {
        console.error("❌ [Exchange] La respuesta no contiene link_token:", data);
        throw new Error("Fintoc no devolvió link_token válido");
      }
      if (!finalToken.includes('_token_')) {
        console.warn("⚠️ [Exchange] link_token podría tener formato incorrecto. Esperado: LINK_ID_token_LINK_ACCESS_TOKEN");
      }
      console.log("✅ [Exchange] Token intercambiado. Formato correcto:", finalToken.substring(0, 40) + "...");
    } else {
      const errorText = await exchangeResponse.text();
      console.error(`❌ [Exchange] Falló (${exchangeResponse.status}):`, errorText);
      throw new Error(`Error al intercambiar token con Fintoc: ${exchangeResponse.status}`);
    }
  } catch (err: any) {
    console.error("❌ [Exchange] Error:", err);
    throw err;
  }

  // Guardamos en Supabase
  const { error } = await supabase
    .from('bank_accounts')
    .insert({
      user_id: user.id,
      fintoc_id: finalToken,
      institution_name: institutionName,
      institution_id: institutionId
    })

  if (error) {
    console.error("Error DB:", error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

/**
 * 2. OBTENER GASTOS (FINTOC LIVE)
 * 🔍 REFACTORIZADO: Logs estructurados + Manejo de errores 403
 */
export async function getAntExpenses(linkToken: string) {
  // 🛡️ VALIDACIÓN INICIAL
  if (!linkToken || typeof linkToken !== 'string') {
    console.error("❌ [getAntExpenses] linkToken inválido:", linkToken);
    return [];
  }

  if (!FINTOC_SECRET_KEY) {
    console.error("❌ [getAntExpenses] FINTOC_SECRET_KEY no está definida en .env.local");
    return [];
  }

  // 🛡️ VALIDAR FORMATO DE API KEY
  const keyPrefix = FINTOC_SECRET_KEY.substring(0, 8);
  if (!FINTOC_SECRET_KEY.startsWith('sk_live_') && !FINTOC_SECRET_KEY.startsWith('sk_test_')) {
    console.warn("⚠️ [getAntExpenses] La API key no tiene el formato esperado (sk_live_ o sk_test_)");
    console.warn("   Formato actual:", keyPrefix + "...");
  }

  console.log("🔍 [getAntExpenses] Iniciando con linkToken:", linkToken.substring(0, 20) + "...");
  console.log("🔑 [getAntExpenses] Key presente:", FINTOC_SECRET_KEY.substring(0, 15) + "...");
  console.log("🔑 [getAntExpenses] Tipo de key:", FINTOC_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : FINTOC_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'DESCONOCIDO');

  // 📡 HEADERS: Fintoc requiere solo la key, sin "Bearer"
  const headers = {
    'Authorization': FINTOC_SECRET_KEY,
    'Content-Type': 'application/json',
  };

  try {
    // 1. OBTENER TODAS LAS CUENTAS
    const accountsUrl = `https://api.fintoc.com/v1/accounts?link_token=${linkToken}`;
    console.log("📡 [getAntExpenses] Fetching accounts:", accountsUrl);

    const accountsResponse = await fetch(accountsUrl, {
      headers,
      next: { revalidate: 0 }
    });

    console.log("📊 [getAntExpenses] Accounts response status:", accountsResponse.status);

    // 🛡️ MANEJO DE ERROR 403
    if (accountsResponse.status === 403) {
      const errorText = await accountsResponse.text();
      console.error("❌ [getAntExpenses] ERROR 403 - Forbidden:", errorText);
      console.error("💡 [getAntExpenses] Posibles causas:");
      console.error("   1. La API key no tiene permisos para este link_token");
      console.error("   2. El link_token ha expirado o es inválido");
      console.error("   3. La API key es de sandbox pero el link es de producción (o viceversa)");
      console.error("   4. El formato del header Authorization es incorrecto");
      return [];
    }

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error(`❌ [getAntExpenses] Error ${accountsResponse.status} obteniendo cuentas:`, errorText);
      return [];
    }

    const accounts = await accountsResponse.json();
    console.log("✅ [getAntExpenses] Cuentas recibidas:", Array.isArray(accounts) ? accounts.length : "No es array");

    if (!Array.isArray(accounts)) {
      console.error("❌ [getAntExpenses] La respuesta no es un array:", typeof accounts, accounts);
      return [];
    }

    if (accounts.length === 0) {
      console.warn("⚠️ [getAntExpenses] No se encontraron cuentas para este link_token");
      return [];
    }

    console.log("📋 [getAntExpenses] IDs de cuentas:", accounts.map((acc: any) => acc.id));

    // 2. BUSCAR MOVIMIENTOS EN TODAS LAS CUENTAS (Bucle)
    let allMovements: any[] = [];

    for (const account of accounts) {
      try {
        const movementsUrl = `https://api.fintoc.com/v1/accounts/${account.id}/movements?link_token=${linkToken}&limit=100`;
        console.log(`📡 [getAntExpenses] Fetching movements para cuenta ${account.id}`);

        const moveResponse = await fetch(movementsUrl, {
          headers,
          next: { revalidate: 0 }
        });

        console.log(`📊 [getAntExpenses] Movements response status para ${account.id}:`, moveResponse.status);

        if (moveResponse.status === 403) {
          const errorText = await moveResponse.text();
          console.error(`❌ [getAntExpenses] ERROR 403 obteniendo movimientos de cuenta ${account.id}:`, errorText);
          continue; // Continuamos con la siguiente cuenta
        }

        if (!moveResponse.ok) {
          const errorText = await moveResponse.text();
          console.error(`❌ [getAntExpenses] Error ${moveResponse.status} obteniendo movimientos:`, errorText);
          continue;
        }

        const moves = await moveResponse.json();

        if (Array.isArray(moves)) {
          console.log(`✅ [getAntExpenses] Movimientos encontrados en cuenta ${account.id}:`, moves.length);
          allMovements = [...allMovements, ...moves];
        } else {
          console.warn(`⚠️ [getAntExpenses] La respuesta de movimientos no es un array para cuenta ${account.id}:`, typeof moves);
        }
      } catch (err) {
        console.error(`❌ [getAntExpenses] Error leyendo cuenta ${account.id}:`, err);
      }
    }

    console.log(`📊 [getAntExpenses] Total de movimientos encontrados: ${allMovements.length}`);

    // 3. MAPEAR Y SANITIZAR DATOS
   // En bank.actions.ts (dentro del map)
    const mappedExpenses = allMovements.map((mov: any) => {
      const amount = typeof mov.amount === 'number' ? mov.amount : Number(mov.amount) || 0;
      const description = mov.description || mov.name || 'Sin descripción';
      
      // Usamos el transaction_date directo de Fintoc
      const date = mov.transaction_date || mov.post_date || new Date().toISOString();

      return {
        id: mov.id || `mov_${Date.now()}`,
        description,
        amount,
        date, // Enviamos la fecha cruda
        antCategory: classifyAntExpense(description, amount) || "Gasto General",
        type: amount < 0 ? 'debit' : 'credit',
      };
    });

        console.log(`✅ [getAntExpenses] Retornando ${mappedExpenses.length} gastos mapeados`);
        const firstExpense = mappedExpenses[0];
        if (firstExpense) {
          console.log("📝 [getAntExpenses] Primer gasto de ejemplo:", {
            id: firstExpense.id,
            description: firstExpense.description,
            amount: firstExpense.amount,
            date: firstExpense.date
          });
        }

    return mappedExpenses;

  } catch (error: any) {
    console.error("❌ [getAntExpenses] Error crítico:", error);
    console.error("📋 [getAntExpenses] Stack trace:", error.stack);
    return [];
  }
}

/**
 * 3. OBTENER DETALLES DE CUENTAS (PARA EL DROPDOWN DEL HISTORIAL)
 * Consulta Fintoc para obtener el número de cuenta, saldo y tipo real.
 */
export async function getDetailedAccounts(dbLinks: any[]) {
  let allAccounts: any[] = [];
  const headers = { 'Authorization': process.env.FINTOC_SECRET_KEY!, 'Content-Type': 'application/json' };

  for (const link of dbLinks) {
    try {
      const res = await fetch(`https://api.fintoc.com/v1/accounts?link_token=${link.fintoc_id}`, { headers, next: { revalidate: 0 } });
      if (!res.ok) continue;
      
      const fintocAccounts = await res.json();
      
      fintocAccounts.forEach((acc: any) => {
        // 🧠 EL TRUCO: Fintoc siempre envía la institución real dentro de 'acc'.
        // Si por alguna razón falla, usamos el de la DB como plan B.
        const realBankName = acc.institution?.name || link.institution_name || 'Banco';

        allAccounts.push({
          fintocAccountId: acc.id,
          linkToken: link.fintoc_id,
          institutionName: realBankName, // 👈 Ahora usamos el nombre 100% real (Ej: "Banco Santander")
          name: acc.name,
          number: acc.number || '0000',
          type: acc.type,
          currentBalance: acc.balance?.current || 0,
        });
      });
    } catch (e) {
      console.error("Error obteniendo detalles de cuenta:", e);
    }
  }
  return allAccounts;
}
/**
 * 4. OBTENER MOVIMIENTOS DE UNA SOLA CUENTA ESPECÍFICA
 */
export async function getAccountMovements(linkToken: string, accountId: string) {
  const headers = { 'Authorization': process.env.FINTOC_SECRET_KEY!, 'Content-Type': 'application/json' };
  try {
    const res = await fetch(`https://api.fintoc.com/v1/accounts/${accountId}/movements?link_token=${linkToken}&limit=100`, { headers, next: { revalidate: 0 } });
    if (!res.ok) return [];
    
    const moves = await res.json();
    if (!Array.isArray(moves)) return [];

    return moves.map((mov: any) => {
      const amount = typeof mov.amount === 'number' ? mov.amount : Number(mov.amount) || 0;
      const description = mov.description || mov.name || 'Sin descripción';
      
      return {
        id: mov.id || `mov_${Date.now()}_${Math.random()}`,
        description,
        amount,
        date: mov.transaction_date || mov.post_date || new Date().toISOString(),
        antCategory: classifyAntExpense(description, amount) || "Gasto General",
        type: amount < 0 ? 'debit' : 'credit',
      };
    });
  } catch (error) {
    console.error("Error obteniendo movimientos individuales:", error);
    return [];
  }
}