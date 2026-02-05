// Definimos la interfaz de respuesta
export interface AnalysisResult {
  isHormiga: boolean;
  suggestedCategory: string | null;
  reason: string;
}

// Función principal
export const analyzeExpense = (
  amount: number,
  threshold: number,
  merchantName: string = ""
): AnalysisResult => {
  
  // 1. Convertir a valor absoluto (ignorar signo negativo)
  const absAmount = Math.abs(amount);

  // 2. Si es ingreso (positivo), no es gasto hormiga
  if (amount > 0) {
    return {
      isHormiga: false,
      suggestedCategory: 'Ingreso',
      reason: 'Es un abono a la cuenta'
    };
  }

  // 3. Evaluar si es menor al umbral del usuario
  const isUnderThreshold = absAmount <= threshold;

  // 4. Buscar palabras clave (opcional)
  const hormigaKeywords = ['starbucks', 'mc donalds', 'uber', 'oxxo', 'netflix', 'spotify'];
  // Normalizamos a minúsculas para comparar bien
  const normalizedMerchant = merchantName ? merchantName.toLowerCase() : "";
  
  const matchesKeyword = hormigaKeywords.some(keyword => 
    normalizedMerchant.includes(keyword)
  );

  // 5. Veredicto Final
  if (isUnderThreshold) {
    return {
      isHormiga: true,
      suggestedCategory: matchesKeyword ? 'Gusto Personal' : 'Gasto Hormiga',
      reason: 'Monto menor a tu umbral configurado'
    };
  }
  
  if (matchesKeyword) {
    return {
      isHormiga: true,
      suggestedCategory: 'Suscripciones/Servicios',
      reason: 'Comercio frecuente detectado'
    };
  }

  return {
    isHormiga: false,
    suggestedCategory: null,
    reason: 'Gasto estándar'
  };
};