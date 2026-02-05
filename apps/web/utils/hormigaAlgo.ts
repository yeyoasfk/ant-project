export const detectarHormiga = (description: string) => {
  // 1. Limpiamos el texto (minúsculas y sin espacios extra)
  const cleanDesc = description.toLowerCase().trim();

  // 2. LISTA NEGRA: Palabras que SIEMPRE son gasto hormiga
  const hormigaKeywords = [
    // Comida rápida / Antojos
    'helado', 'chocolate', 'snack', 'papas', 'galletas', 'dulce', 
    'sushi', 'pizza', 'hamburguesa', 'mc donalds', 'kfc', 'starbucks',
    'completo', 'churrasco', 'tacos', 'empanada', 'postre',
    
    // Bebidas
    'cerveza', 'vino', 'trago', 'bebida', 'coca cola', 'sprite', 
    'fanta', 'jugo', 'cafe', 'café', 'redbull', 'monster',

    // Vicios / Ocio
    'cigarro', 'vape', 'tabaco', 'cine', 'entrada', 'juego', 
    'suscripcion', 'netflix', 'spotify', 'youtube',
    
    // Apps de Delivery (Casi siempre son gastos extra)
    'uber', 'rappi', 'pedidos ya', 'didi food', 'ubereats'
  ];

  // 3. Verificamos si alguna palabra prohibida está en la descripción
  const esHormiga = hormigaKeywords.some(keyword => cleanDesc.includes(keyword));

  return esHormiga;
};