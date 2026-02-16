"use server"

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { classifyAntExpense } from '../utils'

// 👇 PEGA TU LLAVE SECRETA AQUÍ ENTRE LAS COMILLAS (La que empieza con sk_live_)
// Esto es temporal para confirmar que la llave funciona.
const FINTOC_SECRET_KEY_HARDCODED = "sk_live_Yg-nQLdQXB5zKnsDrQAVZxryB7AwoeR3VUQPXVKdaX8"; 

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

  console.log("🔍 [Link] Procesando token:", fintocId);
  
  let finalToken = fintocId;

  // Lógica Smart: Si no es un link_token, intentamos canjearlo
  if (!fintocId.startsWith('link_')) {
    try {
      console.log("📡 [Exchange] Iniciando canje con llave hardcodeada...");
      const exchangeResponse = await fetch(
        `https://api.fintoc.com/v1/links/exchange?exchange_token=${fintocId}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': FINTOC_SECRET_KEY_HARDCODED, // Usamos la variable directa
            'Content-Type': 'application/json',
          }
        }
      );

      if (exchangeResponse.ok) {
        const data = await exchangeResponse.json();
        finalToken = data.link_token;
        console.log("✅ [Exchange] Token canjeado:", finalToken);
      } else {
        const errorText = await exchangeResponse.text();
        console.warn(`⚠️ [Exchange] Falló (${exchangeResponse.status}). Usando token original.`, errorText);
      }
    } catch (err) {
      console.error("❌ [Exchange] Error de conexión:", err);
    }
  } else {
    console.log("✅ [Link] El token ya es válido (link_...).");
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
 */
export async function getAntExpenses(linkToken: string) {
  const headers = {
    'Authorization': FINTOC_SECRET_KEY_HARDCODED, // 👈 AQUÍ TAMBIÉN LA USAMOS DIRECTA
    'Content-Type': 'application/json',
  };

  console.log("🚀 [API] Pidiendo cuentas para token:", linkToken);

  try {
    // PASO A: Obtener cuentas
    const accountsResponse = await fetch(
      `https://api.fintoc.com/v1/accounts?link_token=${linkToken}`, 
      { headers, next: { revalidate: 0 } }
    );

    if (!accountsResponse.ok) {
      // Si falla aquí, imprimimos la llave usada (oculta) para depurar
      const errorBody = await accountsResponse.text();
      console.error(`❌ Error al obtener cuentas (Step 1): ${accountsResponse.status}`);
      console.error(`   Llave usada: ${FINTOC_SECRET_KEY_HARDCODED.substring(0, 10)}...`);
      return [];
    }

    const accounts = await accountsResponse.json();

    if (!Array.isArray(accounts) || accounts.length === 0) {
      console.error("⚠️ El Link no tiene cuentas.");
      return [];
    }

    const accountId = accounts[0].id;
    console.log("✅ [API] Cuenta encontrada:", accounts[0].name);
    
    // PASO B: Obtener movimientos
    const movementsResponse = await fetch(
      `https://api.fintoc.com/v1/accounts/${accountId}/movements?link_token=${linkToken}`, 
      { headers, next: { revalidate: 0 } }
    );

    if (!movementsResponse.ok) {
      console.error(`❌ Error al obtener movimientos: ${movementsResponse.status}`);
      return [];
    }

    const movements = await movementsResponse.json();

    if (!Array.isArray(movements)) return [];

    // PASO C: Procesar
    return movements.map((mov: any) => ({
      id: mov.id,
      description: mov.description,
      amount: mov.amount,
      date: mov.post_date || new Date().toISOString(), 
      antCategory: classifyAntExpense(mov.description, mov.amount)
    })).filter((item: any) => item.antCategory !== null);

  } catch (error) {
    console.error("❌ Error crítico API:", error);
    return [];
  }
}