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
 * 🧠 EL CEREBRO DE HORMIGA
 */
async function syncTransactionsToDatabase(userId: string, accountId: string, fintocMoves: any[]) {
  const supabase = await createClient();
  if (!fintocMoves || fintocMoves.length === 0) return;

  const { data: rules } = await supabase.from('transaction_rules').select('*').eq('user_id', userId);

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

  if (error) console.error("❌ Error guardando en DB:", error.message);
}

/**
 * 1. GUARDAR CUENTA EN SUPABASE
 */
export async function linkBankAccount({ fintocId, institutionName, institutionId }: { fintocId: string, institutionName: string, institutionId: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuario no autenticado")

  let finalToken: string;
  let backendInstitutionName = institutionName; 
  let backendInstitutionId = institutionId; 

  try {
    const exchangeResponse = await fetch(`https://api.fintoc.com/v1/links/exchange?exchange_token=${encodeURIComponent(fintocId)}`, {
      method: 'GET',
      headers: { 'Authorization': FINTOC_SECRET_KEY, 'Content-Type': 'application/json' }
    });

    if (exchangeResponse.ok) {
      const data = await exchangeResponse.json();
      finalToken = data.link_token;
      if (data.institution) {
        backendInstitutionName = data.institution.name;
        backendInstitutionId = data.institution.id;
      }
      if (!finalToken) throw new Error("Fintoc no devolvió link_token válido");
    } else {
      throw new Error(`Error al intercambiar token: ${exchangeResponse.status}`);
    }
  } catch (err: any) {
    throw err;
  }

  const { error } = await supabase.from('bank_accounts').insert({
    user_id: user.id, fintoc_id: finalToken, institution_name: backendInstitutionName, institution_id: backendInstitutionId
  });

  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true }
}

/**
 * 2. OBTENER GASTOS GLOBALES
 */
export async function getAntExpenses(linkToken: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 🛡️ OBTENER CUENTAS OCULTAS
  let hiddenAccountIds: string[] = [];
  const { data: hiddenData } = await supabase.from('hidden_accounts').select('account_id').eq('user_id', user.id);
  if (hiddenData) hiddenAccountIds = hiddenData.map(h => h.account_id);

  const headers = { 'Authorization': FINTOC_SECRET_KEY, 'Content-Type': 'application/json' };

  try {
    const accountsRes = await fetch(`https://api.fintoc.com/v1/accounts?link_token=${linkToken}`, { headers, next: { revalidate: 0 } });
    if (accountsRes.ok) {
      const accounts = await accountsRes.json();
      if (Array.isArray(accounts)) {
        for (const account of accounts) {
          if (hiddenAccountIds.includes(account.id)) continue; // 🚫 Ignorar fetch

          const moveRes = await fetch(`https://api.fintoc.com/v1/accounts/${account.id}/movements?link_token=${linkToken}&limit=100`, { headers, next: { revalidate: 0 } });
          if (moveRes.ok) {
            const moves = await moveRes.json();
            if (Array.isArray(moves)) await syncTransactionsToDatabase(user.id, account.id, moves);
          }
        }
      }
    }

    const { data: dbTransactions } = await supabase
      .from('transactions')
      .select('*, category:categories(name, color)')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!dbTransactions) return [];

    // 🚫 PURGA DE HISTORIAL: Excluimos transacciones si su cuenta fue apagada
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
    console.error("❌ Error en getAntExpenses:", error);
    return [];
  }
}

/**
 * 3. OBTENER DETALLES DE CUENTAS 
 * 🆕 Ahora acepta un parámetro (includeHidden) que por defecto es FALSE.
 */
export async function getDetailedAccounts(dbLinks: any[], includeHidden: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let allAccounts: any[] = [];
  
  let hiddenAccountIds: string[] = [];
  if (user) {
    const { data: hiddenData } = await supabase.from('hidden_accounts').select('account_id').eq('user_id', user.id);
    if (hiddenData) hiddenAccountIds = hiddenData.map(h => h.account_id);
  }

  const headers = { 'Authorization': process.env.FINTOC_SECRET_KEY!, 'Content-Type': 'application/json' };

  for (const link of dbLinks) {
    try {
      const res = await fetch(`https://api.fintoc.com/v1/accounts?link_token=${link.fintoc_id}`, { headers, next: { revalidate: 0 } });
      if (!res.ok) continue;
      const fintocAccounts = await res.json();
      
      fintocAccounts.forEach((acc: any) => {
        const isHidden = hiddenAccountIds.includes(acc.id);
        
        // 🚫 MAGIA: Si no pedimos cuentas ocultas explícitamente, las eliminamos de la lista
        if (!includeHidden && isHidden) return; 

        const officialBankName = CHILEAN_BANKS[link.institution_id] || link.institution_name || 'Banco Desconocido';
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
    } catch (e) { console.error("Error obteniendo detalles de cuenta:", e); }
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

  // 🛡️ Verificar si la cuenta está oculta
  let hiddenAccountIds: string[] = [];
  const { data: hiddenData } = await supabase.from('hidden_accounts').select('account_id').eq('user_id', user.id);
  if (hiddenData) hiddenAccountIds = hiddenData.map(h => h.account_id);
  
  if (hiddenAccountIds.includes(accountId)) return []; // 🚫 Bloqueo de seguridad

  const headers = { 'Authorization': process.env.FINTOC_SECRET_KEY!, 'Content-Type': 'application/json' };
  try {
    const res = await fetch(`https://api.fintoc.com/v1/accounts/${accountId}/movements?link_token=${linkToken}&limit=100`, { headers, next: { revalidate: 0 } });
    if (res.ok) {
      const moves = await res.json();
      if (Array.isArray(moves)) await syncTransactionsToDatabase(user.id, accountId, moves);
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
    console.error("Error obteniendo movimientos individuales:", error);
    return [];
  }
}

/**
 * 5. FORZAR SINCRONIZACIÓN
 */
export async function forceBankSync(linkToken: string) {
  try {
    const url = `https://api.fintoc.com/v1/refresh_intents?link_token=${linkToken}&refresh_type=only_last`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': process.env.FINTOC_SECRET_KEY!, 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
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