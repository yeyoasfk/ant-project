"use server"

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

export async function categorizeTransaction({
  transactionDbId,
  categoryId,
  isAntExpense,
  ruleKeyword,
  applyToPast // 👈 NUEVO PARÁMETRO
}: {
  transactionDbId: string,
  categoryId: string | null,
  isAntExpense: boolean,
  ruleKeyword?: string,
  applyToPast?: boolean // 👈 NUEVO PARÁMETRO
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Usuario no autenticado" };

  try {
    // 1. Actualizamos el gasto específico que clickeaste
    await supabase.from('transactions').update({
      category_id: categoryId,
      is_ant_expense: isAntExpense
    }).eq('id', transactionDbId).eq('user_id', user.id);

    // 2. Lógica de Reglas Automáticas
    if (ruleKeyword && categoryId) {
      
      // A. Guardamos la regla para el FUTURO
      await supabase.from('transaction_rules').insert({
        user_id: user.id,
        keyword: ruleKeyword,
        category_id: categoryId
      });

      // B. ⏪ LA MAGIA RETROACTIVA: Si el usuario marcó la casilla, actualizamos el PASADO
      if (applyToPast) {
        await supabase.from('transactions')
          .update({
            category_id: categoryId,
            is_ant_expense: isAntExpense // Le aplica la hormiga también si la encendiste
          })
          .eq('user_id', user.id)
          .ilike('description', `%${ruleKeyword}%`); // Busca la palabra en cualquier parte de la descripción
      }
    }

    // 3. Recargamos la interfaz
    revalidatePath('/transaction-history');
    revalidatePath('/presupuestos');
    
    return { success: true };
  } catch (error: any) {
    console.error("Error al categorizar:", error);
    return { success: false, error: error.message };
  }
}