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

    // 1. Intercambio de Token (UNA SOLA VEZ)
    const exchangeResp = await fetch(`https://api.fintoc.com/v1/links/exchange?exchange_token=${exchange_token}`, {
      method: 'GET',
      headers: { 'Authorization': FINTOC_SECRET_KEY! } // El '!' es clave
    });

    if (!exchangeResp.ok) {
        throw new Error(await exchangeResp.text());
    }

    const linkData = await exchangeResp.json();
    const linkToken = linkData.link_token; 

    // 2. Obtener Cuentas
    const accountsResp = await fetch(`https://api.fintoc.com/v1/accounts?link_token=${linkToken}`, {
        headers: { 'Authorization': FINTOC_SECRET_KEY! }
    });
    const accounts = await accountsResp.json();

    let totalMovimientos = 0;

    // 3. Descargar Movimientos
    for (const account of accounts) {
        const movementsResp = await fetch(`https://api.fintoc.com/v1/accounts/${account.id}/movements?link_token=${linkToken}`, {
            headers: { 'Authorization': FINTOC_SECRET_KEY! }
        });
        const movements = await movementsResp.json();

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