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
    // (Esto nos da permiso para leer la cuenta)
    const exchangeResp = await fetch(`https://api.fintoc.com/v1/links/exchange?exchange_token=${exchange_token}`, {
      method: 'GET',
      headers: { 'Authorization': FINTOC_SECRET_KEY }
    });

    if (!exchangeResp.ok) {
        throw new Error('Error intercambiando token con Fintoc');
    }

    const linkData = await exchangeResp.json();
    const linkToken = linkData.link_token; // La llave maestra de esta cuenta

    // 2. Obtener las cuentas bancarias de este Link
    const accountsResp = await fetch(`https://api.fintoc.com/v1/accounts?link_token=${linkToken}`, {
        headers: { 'Authorization': FINTOC_SECRET_KEY }
    });
    const accounts = await accountsResp.json();

    let totalMovimientos = 0;

    // 3. Para cada cuenta, bajamos los movimientos
    for (const account of accounts) {
        const movementsResp = await fetch(`https://api.fintoc.com/v1/accounts/${account.id}/movements?link_token=${linkToken}`, {
            headers: { 'Authorization': FINTOC_SECRET_KEY }
        });
        const movements = await movementsResp.json();

        // 4. Guardar cada movimiento en Supabase
        for (const mov of movements) {
            const esHormiga = detectarHormiga(mov.description);
            
            // Verificamos si ya existe para no duplicar (usando fintoc_transaction_id)
            const { error } = await supabase.from('transactions').upsert({
                fintoc_transaction_id: mov.id,
                amount: Math.abs(mov.amount), // Fintoc a veces manda negativo los gastos
                description: mov.description,
                date: mov.transaction_date || mov.post_date, // Fecha real
                is_hormiga: esHormiga,
                category: esHormiga ? 'Gasto Hormiga' : 'General',
                currency: mov.currency
            }, { onConflict: 'fintoc_transaction_id' }); // Evita duplicados si corres esto 2 veces

            if (!error) totalMovimientos++;
        }
    }

    return NextResponse.json({ success: true, movimientos_guardados: totalMovimientos });

  } catch (error: any) {
    console.error('❌ Error en sync:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}