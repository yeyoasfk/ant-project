import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { ANT_EXPENSE_KEYWORDS, ANT_EXPENSE_THRESHOLD } from "@/app/constants/ant-expenses";

// Utilidad para combinar clases de Tailwind (ya la tenías)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ NUEVA: Utilidad para formatear dinero a Peso Chileno
export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0, // En Chile no solemos usar centavos
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (dateString: string) => {
  if (!dateString) return "—";
  
  const date = new Date(dateString);
  
  // 1. Detectamos si la hora es la que forzamos (12:00 UTC) o la del banco (00:00 UTC)
  const isGenericTime = dateString.includes('T12:00:00') || dateString.includes('T00:00:00');

  // 2. Si la hora no es real, mostramos SOLO la fecha
  if (isGenericTime) {
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // 3. Si la hora SÍ es real, preparamos las opciones para Fecha + Hora
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  // 4. Retornamos la fecha y hora completa
  return date.toLocaleString('es-CL', options);
};

export const getTransactionStatus = (date: Date) => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  return date > twoDaysAgo ? "Procesando" : "Exitoso";
};

export function classifyAntExpense(description: string, amount: number) {
  const descLower = description.toLowerCase();
  
  if (amount > 0) return null; // Sigue ignorando depósitos

  if (Math.abs(amount) > ANT_EXPENSE_THRESHOLD) return null;

  for (const group of ANT_EXPENSE_KEYWORDS) {
    if (group.keywords.some(key => descLower.includes(key))) {
      return group.category;
    }
  }

  // 🚩 CAMBIO CLAVE: En lugar de return null, usa esto:
  return "Otros Gastos"; 
}

export const authFormSchema = (type: 'sign-in' | 'sign-up') => {
  return z.object({
    // --- LOGIN & REGISTER ---
    email: z.string().email("Email inválido"),
    password: type === 'sign-in' 
      ? z.string().min(1, "Ingresa tu contraseña") // Login: Solo que no esté vacía
      : z.string()
        .min(8, "Mínimo 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una Mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una Minúscula")
        .regex(/[0-9]/, "Debe contener al menos un Número")
        .regex(/[\W_]/, "Debe contener al menos un carácter especial (!, @, #, etc.)"),

    // --- SOLO REGISTER ---
    firstName: type === 'sign-in' ? z.string().optional() : z.string().min(3, "Requerido"),
    lastName: type === 'sign-in' ? z.string().optional() : z.string().min(3, "Requerido"),
    address1: type === 'sign-in' ? z.string().optional() : z.string().min(5, "Dirección muy corta"),
    
    // Lista desplegable
    state: type === 'sign-in' ? z.string().optional() : z.string().min(1, "Selecciona una región"),
    city: type === 'sign-in' ? z.string().optional() : z.string().min(1, "Selecciona una comuna"),
    
    // Opcional
    postalCode: z.string().optional(),

    // RUT: Formato XXXXXXXX-X (Sin puntos)
    rut: type === 'sign-in' ? z.string().optional() : z.string()
      .regex(/^\d{7,8}-[\dKk]$/, "Formato inválido. Usa: 11111111-1 (sin puntos)"),

    // FECHA INTELIGENTE: Acepta YYYY-MM-DD o YYYYMMDD
    // FECHA INTELIGENTE: Recibe formato YYYY/MM/DD
    dateOfBirth: type === 'sign-in' ? z.string().optional() : z.string()
      .min(10, "La fecha está incompleta (YYYY/MM/DD)")
      .transform((val) => val.replace(/\//g, '-')) // Cambiamos / por - para que el constructor Date lo entienda mejor (2002-01-01)
      .refine((val) => {
        // Validar formato YYYY-MM-DD
        return /^\d{4}-\d{2}-\d{2}$/.test(val);
      }, "Formato inválido. Usa YYYY/MM/DD")
      .refine((val) => {
        const date = new Date(val);
        const today = new Date();
        // Calculo de edad exacto
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
            age--;
        }
        return age >= 18;
      }, "Debes ser mayor de 18 años para registrarte.")
      .refine((val) => {
        const date = new Date(val);
        const year = date.getFullYear();
        return year > 1900 && year < new Date().getFullYear(); 
      }, "Año de nacimiento no válido."),
  })
}