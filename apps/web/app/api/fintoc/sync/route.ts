import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { detectarHormiga } from '../../../../utils/hormigaAlgo';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FINTOC_SECRET_KEY = process.env.FINTOC_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { exchange_token } = body;

    // 🛡️ Validación estricta
    if (!exchange_token) {
      return NextResponse.json({ error: 'Token vacío o nulo' }, { status: 400 });
    }

    console.log('🔄 Procesando token:', exchange_token);

    // 🛡️ VALIDACIÓN
    if (!FINTOC_SECRET_KEY) {
      console.error('❌ [Fintoc Sync] FINTOC_SECRET_KEY no está definida');
      return NextResponse.json({ error: 'FINTOC_SECRET_KEY no configurada' }, { status: 500 });
    }

    console.log('🔍 [Fintoc Sync] Procesando exchange_token:', exchange_token.substring(0, 20) + '...');

    // 1. Intercambio de Token (UNA SOLA VEZ)
    const exchangeResp = await fetch(`https://api.fintoc.com/v1/links/exchange?exchange_token=${exchange_token}`, {
      method: 'GET',
      headers: { 'Authorization': FINTOC_SECRET_KEY } // Fintoc requiere solo la key, sin "Bearer"
    });

    console.log('📊 [Fintoc Sync] Exchange response status:', exchangeResp.status);

    if (exchangeResp.status === 403) {
      const errorText = await exchangeResp.text();
      console.error('❌ [Fintoc Sync] ERROR 403 en exchange:', errorText);
      return NextResponse.json({ 
        error: 'Error de autenticación con Fintoc (403). Verifica tu API key.' 
      }, { status: 403 });
    }

    if (!exchangeResp.ok) {
      const errorText = await exchangeResp.text();
      console.error(`❌ [Fintoc Sync] Error ${exchangeResp.status} en exchange:`, errorText);
      throw new Error(errorText);
    }

    const linkData = await exchangeResp.json();
    const linkToken = linkData.link_token; 
    console.log('✅ [Fintoc Sync] Token intercambiado exitosamente');

    // 2. Obtener Cuentas
    const accountsResp = await fetch(`https://api.fintoc.com/v1/accounts?link_token=${linkToken}`, {
        headers: { 'Authorization': FINTOC_SECRET_KEY }
    });

    console.log('📊 [Fintoc Sync] Accounts response status:', accountsResp.status);

    if (accountsResp.status === 403) {
      const errorText = await accountsResp.text();
      console.error('❌ [Fintoc Sync] ERROR 403 obteniendo cuentas:', errorText);
      return NextResponse.json({ 
        error: 'Error de autenticación con Fintoc (403) al obtener cuentas.' 
      }, { status: 403 });
    }

    if (!accountsResp.ok) {
      const errorText = await accountsResp.text();
      console.error(`❌ [Fintoc Sync] Error ${accountsResp.status} obteniendo cuentas:`, errorText);
      throw new Error(errorText);
    }

    const accounts = await accountsResp.json();
    console.log('✅ [Fintoc Sync] Cuentas obtenidas:', Array.isArray(accounts) ? accounts.length : 'No es array');

    if (!Array.isArray(accounts) || accounts.length === 0) {
      console.warn('⚠️ [Fintoc Sync] No se encontraron cuentas');
      return NextResponse.json({ success: true, movimientos_guardados: 0 });
    }

    let totalMovimientos = 0;

    // 3. Descargar Movimientos
    for (const account of accounts) {
        console.log(`📡 [Fintoc Sync] Obteniendo movimientos para cuenta ${account.id}`);
        const movementsResp = await fetch(`https://api.fintoc.com/v1/accounts/${account.id}/movements?link_token=${linkToken}`, {
            headers: { 'Authorization': FINTOC_SECRET_KEY }
        });

        console.log(`📊 [Fintoc Sync] Movements response status para ${account.id}:`, movementsResp.status);

        if (movementsResp.status === 403) {
          const errorText = await movementsResp.text();
          console.error(`❌ [Fintoc Sync] ERROR 403 obteniendo movimientos de cuenta ${account.id}:`, errorText);
          continue; // Continuamos con la siguiente cuenta
        }

        if (!movementsResp.ok) {
          const errorText = await movementsResp.text();
          console.error(`❌ [Fintoc Sync] Error ${movementsResp.status} obteniendo movimientos:`, errorText);
          continue;
        }

        const movements = await movementsResp.json();
        console.log(`✅ [Fintoc Sync] Movimientos obtenidos para cuenta ${account.id}:`, Array.isArray(movements) ? movements.length : 'No es array');

        for (const mov of movements) {
            const esHormiga = detectarHormiga(mov.description);
            const { error } = await supabase.from('transactions').upsert({
                fintoc_transaction_id: mov.id,
                amount: Math.abs(mov.amount),
                description: mov.description,
                date: mov.transaction_date || mov.post_date,
                is_hormiga: esHormiga,
                category: esHormiga ? 'Gasto Hormiga' : 'General',
                currency: mov.currency
            }, { onConflict: 'fintoc_transaction_id' });

            if (!error) totalMovimientos++;
        }
    }

    return NextResponse.json({ success: true, movimientos_guardados: totalMovimientos });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}