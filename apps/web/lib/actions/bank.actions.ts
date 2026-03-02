"use server"

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

const CHILEAN_BANKS: Record<string, string> = {
  'cl_banco_estado': 'Banco Estado',
  'cl_banco_bci': 'Banco BCI',
  'cl_banco_de_chile': 'Banco de Chile',
  'cl_banco_santander': 'Banco Santander',
  'cl_banco_itau': 'Banco Itaú',
  'cl_banco_scotiabank': 'Scotiabank',
  'cl_banco_falabella': 'Banco Falabella',
  'cl_banco_security': 'Banco Security',
  'cl_banco_bice': 'Banco BICE',
  'cl_banco_consorcio': 'Banco Consorcio',
  'cl_banco_ripley': 'Banco Ripley',
  'cl_mercado_pago': 'Mercado Pago',
  'cl_mach': 'Mach',
  'cl_tenpo': 'Tenpo'
};

const FINTOC_SECRET_KEY = process.env.FINTOC_SECRET_KEY!;

/**
 * 🧠 EL CEREBRO DE HORMIGA — Sincroniza movimientos de Fintoc a nuestra DB
 */
async function syncTransactionsToDatabase(userId: string, accountId: string, fintocMoves: any[]) {
  const supabase = await createClient();
  if (!fintocMoves || fintocMoves.length === 0) {
    console.log(`📭 [Sync] No hay movimientos para sincronizar en cuenta ${accountId}`);
    return;
  }

  const { data: rules } = await supabase
    .from('transaction_rules')
    .select('*')
    .eq('user_id', userId);

  const transactionsToSave = fintocMoves.map((mov: any) => {
    const amount = typeof mov.amount === 'number' ? mov.amount : Number(mov.amount) || 0;
    const description = mov.description || mov.name || 'Sin descripción';
    const date = mov.transaction_date || mov.post_date || new Date().toISOString();
    const type = amount < 0 ? 'debit' : 'credit';

    let categoryId = null;
    if (rules && rules.length > 0) {
      const matchedRule = rules.find((r: any) =>
        description.toLowerCase().includes(r.keyword.toLowerCase())
      );
      if (matchedRule) categoryId = matchedRule.category_id;
    }

    // Un gasto hormiga es un débito de hasta $5.000 CLP
    const isAnt = amount < 0 && Math.abs(amount) <= 5000;

    return {
      user_id: userId,
      account_id: accountId,
      fintoc_transaction_id: mov.id,
      description,
      amount,
      date,
      type,
      category_id: categoryId,
      is_ant_expense: isAnt
    };
  });

  const { error } = await supabase
    .from('transactions')
    .upsert(transactionsToSave, {
      onConflict: 'fintoc_transaction_id',
      ignoreDuplicates: true
    });

  if (error) {
    console.error(`❌ [Sync] Error de DB guardando ${transactionsToSave.length} transacciones:`, error.message);
  } else {
    console.log(`✅ [Sync] ${transactionsToSave.length} transacciones sincronizadas para cuenta ${accountId}`);
  }
}

/**
 * 1. GUARDAR CUENTA Y DESCARGA INICIAL
 *
 * Flujo oficial Fintoc (Link Intents):
 *   1. Widget onSuccess → linkIntent.exchangeToken (temporal, li_xxx_xt_yyy)
 *   2. GET /v1/links/exchange?exchange_token={token} → { link_token: "link_xxx_token_yyy" }
 *   3. Guardar link_token en DB + descargar movimientos iniciales
 *
 * Prerequisito: el banco NO debe tener una sesión previa activa.
 * Si el widget devuelve link_created sin exchangeToken, el usuario debe
 * revocar el acceso desde su banca en línea y volver a vincular.
 */
export async function linkBankAccount({
  exchangeToken,
  institutionName,
  institutionId,
}: {
  exchangeToken: string;
  institutionName: string;
  institutionId: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");
  if (!exchangeToken) throw new Error("Se requiere exchangeToken de Fintoc.");

  const headers = { 'Authorization': FINTOC_SECRET_KEY, 'Content-Type': 'application/json' };

  console.log(`🔄 [linkBankAccount] Exchange: ${exchangeToken.substring(0, 30)}...`);

  // PASO 2: Intercambiar exchangeToken → link_token permanente
  const exchRes = await fetch(
    `https://api.fintoc.com/v1/links/exchange?exchange_token=${encodeURIComponent(exchangeToken)}`,
    { method: 'GET', headers, cache: 'no-store' }
  );
  if (!exchRes.ok) {
    const err = await exchRes.text();
    throw new Error(`Error en exchange Fintoc (${exchRes.status}): ${err}`);
  }
  const exchData = await exchRes.json();
  console.log(`📋 [linkBankAccount] Exchange keys: ${Object.keys(exchData).join(', ')}`);

  const linkToken: string = exchData.link_token;
  if (!linkToken || !linkToken.includes('_token_')) {
    throw new Error(`link_token inválido. Respuesta: ${JSON.stringify(exchData)}`);
  }
  console.log(`✅ [linkBankAccount] link_token: ${linkToken.substring(0, 35)}...`);

  if (exchData.institution) {
    institutionName = CHILEAN_BANKS[exchData.institution.id] || exchData.institution.name || institutionName;
    institutionId = exchData.institution.id || institutionId;
  }

  // Evitar duplicados
  const { data: existing } = await supabase
    .from('bank_accounts').select('id')
    .eq('fintoc_id', linkToken).eq('user_id', user.id).maybeSingle();

  if (existing) {
    console.log("⚠️ [linkBankAccount] Cuenta ya vinculada. Sincronizando datos frescos.");
    await downloadInitialTransactions(linkToken, user.id);
    revalidatePath('/');
    return { success: true };
  }

  // PASO 3: Guardar en DB
  const { error: insertError } = await supabase.from('bank_accounts').insert({
    user_id: user.id, fintoc_id: linkToken,
    institution_name: institutionName, institution_id: institutionId
  });
  if (insertError) throw new Error(`Error guardando cuenta: ${insertError.message}`);
  console.log("✅ [linkBankAccount] Cuenta guardada. Descargando movimientos...");

  // Descarga inicial de movimientos
  try {
    await downloadInitialTransactions(linkToken, user.id);
  } catch (syncError: any) {
    console.error("⚠️ [linkBankAccount] Sync inicial falló (no fatal):", syncError.message);
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Helper: Descarga cuentas y movimientos de un link_token y los guarda en DB
 */
async function downloadInitialTransactions(linkToken: string, userId: string) {
  const headers = {
    'Authorization': FINTOC_SECRET_KEY,
    'Content-Type': 'application/json'
  };

  console.log(`📡 [Download] Obteniendo cuentas para link: ${linkToken.substring(0, 25)}...`);

  const accountsRes = await fetch(
    `https://api.fintoc.com/v1/accounts?link_token=${linkToken}`,
    { headers, cache: 'no-store' }
  );

  if (!accountsRes.ok) {
    const errText = await accountsRes.text();
    throw new Error(`Error ${accountsRes.status} obteniendo cuentas de Fintoc: ${errText}`);
  }

  const accounts = await accountsRes.json();

  if (!Array.isArray(accounts) || accounts.length === 0) {
    console.warn(`⚠️ [Download] Fintoc no devolvió cuentas para este link_token.`);
    return;
  }

  console.log(`📋 [Download] ${accounts.length} cuenta(s) encontradas. Descargando movimientos...`);

  for (const account of accounts) {
    const movRes = await fetch(
      `https://api.fintoc.com/v1/accounts/${account.id}/movements?link_token=${linkToken}&limit=100`,
      { headers, cache: 'no-store' }
    );

    if (!movRes.ok) {
      const errText = await movRes.text();
      console.error(`❌ [Download] Error ${movRes.status} obteniendo movimientos de cuenta ${account.id}: ${errText}`);
      continue;
    }

    const moves = await movRes.json();
    if (Array.isArray(moves) && moves.length > 0) {
      await syncTransactionsToDatabase(userId, account.id, moves);
    } else {
      console.log(`📭 [Download] Sin movimientos para cuenta ${account.id}`);
    }
  }
}

/**
 * 2. OBTENER GASTOS GLOBALES (lee desde DB, re-sincroniza con Fintoc)
 */
export async function getAntExpenses(linkToken: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let hiddenAccountIds: string[] = [];
  const { data: hiddenData } = await supabase
    .from('hidden_accounts')
    .select('account_id')
    .eq('user_id', user.id);
  if (hiddenData) hiddenAccountIds = hiddenData.map(h => h.account_id);

  const headers = {
    'Authorization': FINTOC_SECRET_KEY,
    'Content-Type': 'application/json'
  };

  try {
    const accountsRes = await fetch(
      `https://api.fintoc.com/v1/accounts?link_token=${linkToken}`,
      { headers, cache: 'no-store' }
    );

    if (accountsRes.ok) {
      const accounts = await accountsRes.json();
      if (Array.isArray(accounts)) {
        for (const account of accounts) {
          if (hiddenAccountIds.includes(account.id)) continue;

          const moveRes = await fetch(
            `https://api.fintoc.com/v1/accounts/${account.id}/movements?link_token=${linkToken}&limit=100`,
            { headers, cache: 'no-store' }
          );
          if (moveRes.ok) {
            const moves = await moveRes.json();
            if (Array.isArray(moves)) {
              await syncTransactionsToDatabase(user.id, account.id, moves);
            }
          } else {
            const errText = await moveRes.text();
            console.error(`❌ [getAntExpenses] Error movimientos cuenta ${account.id} (${moveRes.status}): ${errText}`);
          }
        }
      }
    } else {
      const errText = await accountsRes.text();
      console.error(`❌ [getAntExpenses] Error cuentas (${accountsRes.status}): ${errText}`);
    }

    const { data: dbTransactions } = await supabase
      .from('transactions')
      .select('*, category:categories(name, color)')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!dbTransactions) return [];

    const visibleTransactions = dbTransactions.filter(t => !hiddenAccountIds.includes(t.account_id));

    return visibleTransactions.map(t => ({
      id: t.fintoc_transaction_id,
      db_id: t.id,
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
      type: t.type,
      categoryId: t.category_id,
      categoryName: t.category?.name || "Sin Categoría",
      categoryColor: t.category?.color || "#808080",
      antCategory: t.is_ant_expense ? "Gasto Hormiga" : "Gasto General"
    }));

  } catch (error) {
    console.error("❌ [getAntExpenses] Error:", error);
    return [];
  }
}

/**
 * 3. OBTENER DETALLES DE CUENTAS DESDE FINTOC
 */
export async function getDetailedAccounts(dbLinks: any[], includeHidden: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let allAccounts: any[] = [];

  let hiddenAccountIds: string[] = [];
  if (user) {
    const { data: hiddenData } = await supabase
      .from('hidden_accounts')
      .select('account_id')
      .eq('user_id', user.id);
    if (hiddenData) hiddenAccountIds = hiddenData.map(h => h.account_id);
  }

  const headers = {
    'Authorization': process.env.FINTOC_SECRET_KEY!,
    'Content-Type': 'application/json'
  };

  for (const link of dbLinks) {
    try {
      const res = await fetch(
        `https://api.fintoc.com/v1/accounts?link_token=${link.fintoc_id}`,
        { headers, cache: 'no-store' }
      );
      if (!res.ok) {
        const errText = await res.text();
        console.error(`❌ [getDetailedAccounts] Error cuentas (${res.status}, token: ${link.fintoc_id?.substring(0, 20)}...): ${errText}`);
        continue;
      }
      const fintocAccounts = await res.json();

      fintocAccounts.forEach((acc: any) => {
        const isHidden = hiddenAccountIds.includes(acc.id);

        if (!includeHidden && isHidden) return;

        const officialBankName =
          CHILEAN_BANKS[link.institution_id] ||
          link.institution_name ||
          'Banco Desconocido';

        allAccounts.push({
          fintocAccountId: acc.id,
          linkToken: link.fintoc_id,
          institutionName: officialBankName,
          name: acc.name,
          number: acc.number || '0000',
          type: acc.type,
          currency: acc.currency,
          currentBalance: acc.balance?.current || 0,
          isHidden: isHidden
        });
      });
    } catch (e) {
      console.error("❌ [getDetailedAccounts] Error:", e);
    }
  }
  return allAccounts;
}

/**
 * 4. OBTENER MOVIMIENTOS DE UNA SOLA CUENTA
 */
export async function getAccountMovements(linkToken: string, accountId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let hiddenAccountIds: string[] = [];
  const { data: hiddenData } = await supabase
    .from('hidden_accounts')
    .select('account_id')
    .eq('user_id', user.id);
  if (hiddenData) hiddenAccountIds = hiddenData.map(h => h.account_id);

  if (hiddenAccountIds.includes(accountId)) return [];

  const headers = {
    'Authorization': process.env.FINTOC_SECRET_KEY!,
    'Content-Type': 'application/json'
  };

  try {
    const res = await fetch(
      `https://api.fintoc.com/v1/accounts/${accountId}/movements?link_token=${linkToken}&limit=100`,
      { headers, cache: 'no-store' }
    );

    if (res.ok) {
      const moves = await res.json();
      if (Array.isArray(moves)) {
        await syncTransactionsToDatabase(user.id, accountId, moves);
      }
    } else {
      const errText = await res.text();
      console.error(`❌ [getAccountMovements] Error (${res.status}, account: ${accountId}): ${errText}`);
    }

    const { data: dbTransactions } = await supabase
      .from('transactions')
      .select('*, category:categories(name, color)')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!dbTransactions) return [];

    return dbTransactions.map(t => ({
      id: t.fintoc_transaction_id,
      db_id: t.id,
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
      type: t.type,
      categoryId: t.category_id,
      categoryName: t.category?.name || "Sin Categoría",
      categoryColor: t.category?.color || "#808080",
      antCategory: t.is_ant_expense ? "Gasto Hormiga" : "Gasto General"
    }));

  } catch (error) {
    console.error("❌ [getAccountMovements] Error:", error);
    return [];
  }
}

/**
 * 5. FORZAR SINCRONIZACIÓN MANUAL (Refresh Intent)
 *    Documentación: POST /v1/refresh_intents con link_token en el BODY
 */
export async function forceBankSync(linkToken: string) {
  try {
    // ✅ CORRECTO: link_token va en el BODY JSON, no en query string
    const response = await fetch('https://api.fintoc.com/v1/refresh_intents', {
      method: 'POST',
      headers: {
        'Authorization': process.env.FINTOC_SECRET_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        link_token: linkToken,
        refresh_type: 'movements'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [forceBankSync] Error (${response.status}): ${errorText}`);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    console.log("✅ [forceBankSync] Refresh intent creado:", data?.id);
    return { success: true, data };
  } catch (error: any) {
    console.error("❌ [forceBankSync] Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🎛️ INTERRUPTOR DE CUENTAS (Ocultar/Mostrar)
 */
export async function toggleAccountVisibility(accountId: string, hide: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  try {
    if (hide) {
      await supabase.from('hidden_accounts').insert({ user_id: user.id, account_id: accountId });
    } else {
      await supabase.from('hidden_accounts').delete().match({ user_id: user.id, account_id: accountId });
    }
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}