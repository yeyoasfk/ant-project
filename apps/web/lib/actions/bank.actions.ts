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
            'Authorization': FINTOC_SECRET_KEY, // Usamos la variable directa
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
    'Authorization': FINTOC_SECRET_KEY,
    'Content-Type': 'application/json',
  };

  try {
    // 1. OBTENER TODAS LAS CUENTAS
    const accountsResponse = await fetch(
      `https://api.fintoc.com/v1/accounts?link_token=${linkToken}`, 
      { headers, next: { revalidate: 0 } }
    );
    const accounts = await accountsResponse.json();

    if (!Array.isArray(accounts) || accounts.length === 0) return [];

    // 2. BUSCAR MOVIMIENTOS EN TODAS LAS CUENTAS (Bucle)
    let allMovements: any[] = [];

    // Recorremos cada cuenta para sacar sus movimientos
    for (const account of accounts) {
      try {
        const moveResponse = await fetch(
          `https://api.fintoc.com/v1/accounts/${account.id}/movements?link_token=${linkToken}&limit=30`, 
          { headers, next: { revalidate: 0 } }
        );
        
        if (moveResponse.ok) {
          const moves = await moveResponse.json();
          if (Array.isArray(moves)) {
            // Agregamos los movimientos encontrados a la lista general
            allMovements = [...allMovements, ...moves];
          }
        }
      } catch (err) {
        console.error(`Error leyendo cuenta ${account.id}`, err);
      }
    }

    // 3. MOSTRAR TODO (Sin filtro estricto por ahora)
    // Esto asegura que veas datos si o si.
    return allMovements.map((mov: any) => ({
      id: mov.id,
      description: mov.description,
      amount: mov.amount,
      date: mov.post_date || new Date().toISOString(), 
      // Si no es hormiga, le ponemos "Otros" para que no se oculte
      antCategory: classifyAntExpense(mov.description, mov.amount) || "Gasto General" 
    }));

  } catch (error) {
    console.error("❌ Error crítico API:", error);
    return [];
  }
}