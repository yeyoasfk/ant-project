import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// 1. Importamos la función que SÍ existe en tu proyecto
import { detectarHormiga } from '../../../../utils/hormigaAlgo';

// 2. Usamos la configuración estándar que ya tienes funcionando
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    console.log('webhook: Recibiendo notificación de Fintoc...');

    const payload = await request.json();
    const event = payload.type; 

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

    // 3. EJECUTAR TU CEREBRO 🧠 (Versión simplificada)
    // Usamos tu algoritmo 'detectarHormiga' que solo pide la descripción
    const esGastoHormiga = detectarHormiga(description);

    // 4. Guardar en Base de Datos
    // NOTA: Para este prototipo, guardaremos la transacción directamente.
    // (En el futuro vincularemos el 'account_id' real de Fintoc con tu usuario)
    
    const { error: insertError } = await supabase
        .from('transactions')
        .insert({
            fintoc_transaction_id: fintocTransactionId, // Asegúrate que tu DB tenga esta columna o bórrala si da error
            amount: amount,
            description: description,
            date: new Date().toISOString(),
            // Aquí guardamos la inteligencia aplicada:
            is_hormiga: esGastoHormiga, 
            // Si es hormiga le ponemos una categoría, si no 'General'
            category: esGastoHormiga ? 'Gasto Hormiga' : 'General', 
        });

    if (insertError) {
        console.error('Error guardando transacción:', insertError);
        // No devolvemos error 500 para que Fintoc no siga reintentando infinitamente si es un error de datos
        return NextResponse.json({ error: 'Error DB', details: insertError }, { status: 400 });
    }

    console.log(`✅ Transacción guardada: ${description} (Hormiga: ${esGastoHormiga})`);

    return NextResponse.json({ success: true, is_hormiga: esGastoHormiga });

  } catch (error) {
    console.error('Error crítico en webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}