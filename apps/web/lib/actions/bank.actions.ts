"use server"

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { classifyAntExpense } from '../utils'

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

  const { error } = await supabase
    .from('bank_accounts')
    .insert({
      user_id: user.id,
      fintoc_id: fintocId,
      institution_name: institutionName,
      institution_id: institutionId
    })

  if (error) {
    console.error("Error al guardar cuenta:", error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function getAntExpenses(linkToken: string) {
  try {
    const response = await fetch(`https://api.fintoc.com/v1/movements?link_token=${linkToken}`, {
      headers: { 
        'Authorization': process.env.FINTOC_SECRET_KEY!,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 } // Cache opcional de 1 hora
    });

    if (!response.ok) throw new Error("Error al obtener datos de Fintoc");

    const movements = await response.json();

    return movements
      .map((mov: any) => ({
        id: mov.id,
        description: mov.description,
        amount: mov.amount,
        date: mov.post_date,
        antCategory: classifyAntExpense(mov.description, mov.amount)
      }))
      .filter((mov: any) => mov.antCategory !== null); // Solo nos quedamos con los "hormiga"
  } catch (error) {
    console.error("Error en getAntExpenses:", error);
    return [];
  }
}