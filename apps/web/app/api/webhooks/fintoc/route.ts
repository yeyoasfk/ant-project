import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// Importamos TU lógica compartida (La que acabamos de probar)
import { analyzeExpense } from '@hormiga/api';
// Importamos los tipos de base de datos para no cometer errores
import { Database } from '@hormiga/db';

// Configuración de Supabase con permisos de Admin (Service Role)
// Necesario para escribir en la base de datos sin un usuario logueado en el navegador
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    console.log('webhook: Recibiendo notificación de Fintoc...');

    // 1. Parsear el cuerpo del mensaje que envía el Banco/Fintoc
    const payload = await request.json();
    const event = payload.type; // Ej: 'transaction.created'

    // Solo nos interesan nuevas transacciones
    if (event !== 'transaction.created') {
        return NextResponse.json({ message: 'Evento ignorado' }, { status: 200 });
    }

    const { data: transactionData } = payload;
    const { 
        id: fintocTransactionId, 
        amount, 
        description, 
        currency,
        account_id: fintocAccountId 
    } = transactionData;

    // 2. Identificar al usuario dueño de esta cuenta
    // Buscamos en nuestra DB quién tiene conectada esta cuenta de Fintoc
    const { data: accountData, error: accountError } = await supabaseAdmin
        .from('accounts')
        .select('user_id, user:profiles!user_id(ant_expense_threshold)')
        .eq('fintoc_account_id', fintocAccountId)
        .single();

    if (accountError || !accountData) {
        console.error('Cuenta no encontrada para ID Fintoc:', fintocAccountId);
        return NextResponse.json({ error: 'Cuenta no vinculada' }, { status: 404 });
    }

    // Obtenemos el umbral del usuario (o usamos 5000 por defecto si falla)
    // El "as any" es temporal porque la relación en TS a veces es compleja de inferir
    const userThreshold = (accountData.user as any)?.ant_expense_threshold || 5000;

    // 3. EJECUTAR EL CEREBRO 🧠 (@hormiga/api)
    // Usamos la misma función que probaste en la simulación
    const analysis = analyzeExpense(amount, userThreshold, description);

    // 4. Guardar el resultado en la Base de Datos
    const { error: insertError } = await supabaseAdmin
        .from('transactions')
        .insert({
            user_id: accountData.user_id,
            account_id: accountData.id, // ID interno de nuestra DB
            fintoc_transaction_id: fintocTransactionId,
            amount: amount,
            description: description,
            currency: currency,
            date: new Date().toISOString(),
            // Aquí guardamos la inteligencia aplicada:
            is_hormiga: analysis.isHormiga,
            category: analysis.suggestedCategory || 'General',
            // is_manual_entry: false (por defecto en DB)
        });

    if (insertError) {
        console.error('Error guardando transacción:', insertError);
        return NextResponse.json({ error: 'Error DB' }, { status: 500 });
    }

    console.log(`✅ Transacción guardada: ${description} (Hormiga: ${analysis.isHormiga})`);

    return NextResponse.json({ success: true, analysis });

  } catch (error) {
    console.error('Error crítico en webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}