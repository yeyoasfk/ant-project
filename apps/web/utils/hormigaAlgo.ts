// Lista negra de palabras clave que delatan un gasto hormiga
export const HORMIGA_KEYWORDS = [
  'OXXO',
  'STARBUCKS',
  'UBER',
  'RAPPI',
  'PEDIDOSYA',
  'MCDONALDS',
  'SPOTIFY',
  'NETFLIX',
  'AMAZON PRIME',
  'DOGGIS',
  'DUNKIN',
  'CAFETERIA',
  'HELA', // Por heladerías
  'SUSHI'
];

/**
 * Función que recibe una descripción (ej: "COMPRA OXXO PROVIDENCIA")
 * y devuelve TRUE si encuentra alguna palabra clave.
 */
export function detectarHormiga(description: string): boolean {
  const textoLimpio = description.toUpperCase(); // Convertimos a mayúsculas para no fallar
  
  // Revisamos si alguna palabra clave está dentro del texto
  return HORMIGA_KEYWORDS.some((keyword) => textoLimpio.includes(keyword));
}