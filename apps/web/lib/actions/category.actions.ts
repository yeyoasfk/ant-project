"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ==========================================
// 1. OBTENER (Y AUTO-GENERAR) CATEGORÍAS
// ==========================================
export const getCategories = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Buscamos SOLO las categorías que le pertenecen a este usuario
    let { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id) // 👈 Solo las tuyas
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 🌟 MAGIA: Si el usuario es nuevo y no tiene categorías, le creamos sus 4 básicas
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { user_id: user.id, name: 'Comida', budget_limit: 150000, color: '#9333ea' },
        { user_id: user.id, name: 'Cuentas y Servicios', budget_limit: 80000, color: '#9333ea' },
        { user_id: user.id, name: 'Transporte', budget_limit: 60000, color: '#9333ea' },
        { user_id: user.id, name: 'Salidas y Ocio', budget_limit: 100000, color: '#9333ea' }
      ];
      
      const { data: inserted } = await supabase.from('categories').insert(defaultCategories).select();
      categories = inserted || [];
    }
    
    return categories;
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    return [];
  }
}

// ==========================================
// 2. CREAR UNA NUEVA CATEGORÍA
// ==========================================
interface CreateCategoryProps {
  name: string;
  budget_limit: number;
  color?: string;
}

export const createCategory = async ({ name, budget_limit, color = '#9333ea' }: CreateCategoryProps) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase
      .from('categories')
      .insert([{ user_id: user.id, name, budget_limit, color }])
      .select();

    if (error) throw error;
    revalidatePath('/categorias');
    return data[0];
  } catch (error) {
    console.error("Error creando categoría:", error);
    return null;
  }
}

// ==========================================
// 3. ELIMINAR UNA CATEGORÍA
// ==========================================
export const deleteCategory = async (categoryId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', user.id); 

    if (error) throw error;
    revalidatePath('/categorias');
    return true;
  } catch (error) {
    console.error("Error eliminando categoría:", error);
    return false;
  }
}

// ==========================================
// 4. EDITAR UNA CATEGORÍA
// ==========================================
export const updateCategory = async (categoryId: string, name: string, budget_limit: number) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { error } = await supabase
      .from('categories')
      .update({ name, budget_limit })
      .eq('id', categoryId)
      .eq('user_id', user.id); 

    if (error) throw error;
    revalidatePath('/categorias');
    return true;
  } catch (error) {
    console.error("Error actualizando categoría:", error);
    return false;
  }
}