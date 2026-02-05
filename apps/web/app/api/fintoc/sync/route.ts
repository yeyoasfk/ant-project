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
    const { exchange_token } = await request.json();

    if (!FINTOC_SECRET_KEY) {
      return NextResponse.json({ error: 'Falta configurar FINTOC_SECRET_KEY en Vercel' }, { status: 500 });
    }

    console.log('🔄 Iniciando sincronización de historial...');

    // 1. Intercambiar el token temporal por el LINK TOKEN real
    // (ESTA ES LA ÚNICA VEZ QUE DEBE APARECER ESTE CÓDIGO)
    const exchangeResp = await fetch(`https://api.fintoc.com/v1/links/exchange?exchange_token=${exchange_token}`, {
      method: 'GET',
      headers: { 'Authorization': FINTOC_SECRET_KEY }
    });

    if (!exchangeResp.ok) {
        const errorBody = await exchangeResp.text();
        console.error('😡 Fintoc rechazó el token:', errorBody); 
        throw new Error(`Fintoc Error: ${errorBody}`);
    }

    const linkData = await exchangeResp.json();
    const linkToken = linkData.link_token; 

    // 2. Obtener las cuentas bancarias
    const accountsResp = await fetch(`https://api.fintoc.com/v1/accounts?link_token=${linkToken}`, {
        headers: { 'Authorization': FINTOC_SECRET_KEY }
    });
    const accounts = await accountsResp.json();

    let totalMovimientos = 0;

    // 3. Descargar movimientos de cada cuenta
    for (const account of accounts) {
        const movementsResp = await fetch(`https://api.fintoc.com/v1/accounts/${account.id}/movements?link_token=${linkToken}`, {
            headers: { 'Authorization': FINTOC_SECRET_KEY }
        });
        const movements = await movementsResp.json();

        // 4. Guardar en Supabase
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

    console.log(`✅ Éxito: ${totalMovimientos} movimientos guardados.`);
    return NextResponse.json({ success: true, movimientos_guardados: totalMovimientos });

  } catch (error: any) {
    console.error('❌ Error en sync:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}