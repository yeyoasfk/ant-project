import { analyzeExpense } from './logic/analyzer';

// 1. Definimos un perfil de usuario de prueba
const userProfile = {
  name: "Diego",
  antThreshold: 5000 // Diego considera "Hormiga" todo lo menor a 5 lucas
};

// 2. Simulamos una lista de movimientos bancarios "crudos" (como vienen del banco)
const mockTransactions = [
  { amount: -3500, description: "Starbucks Coffee", merchant: "Starbucks" }, // Caso 1: Gasto Hormiga (Monto + Keyword)
  { amount: -450000, description: "Transferencia Arriendo", merchant: "Propiedades S.A." }, // Caso 2: Gasto Grande (No Hormiga)
  { amount: -2000, description: "Compra en OXXO", merchant: "OXXO" }, // Caso 3: Gasto Pequeño (Hormiga por monto)
  { amount: 800000, description: "Abono Sueldo", merchant: "Empresa Ltda" }, // Caso 4: Ingreso (No Hormiga)
  { amount: -12990, description: "Suscripción Netflix", merchant: "Netflix" }, // Caso 5: Keyword detectada (aunque supere el umbral, a veces queremos marcarlo)
];

console.log(`🐜 Iniciando Simulación para: ${userProfile.name}`);
console.log(`💰 Umbral de dolor: $${userProfile.antThreshold}\n`);
console.log("---------------------------------------------------");

// 3. Ejecutamos el cerebro
mockTransactions.forEach((tx) => {
  // Llamamos a tu lógica pura
  const result = analyzeExpense(tx.amount, userProfile.antThreshold, tx.merchant);

  // 4. Imprimimos el resultado bonito
  const icon = result.isHormiga ? "🔴 HORMIGA DETECTADO" : "✅ Gasto Normal";
  
  console.log(`Movimiento: ${tx.description} ($${tx.amount})`);
  console.log(`Veredicto: ${icon}`);
  if (result.isHormiga) {
    console.log(`  ↳ Razón: ${result.reason}`);
    console.log(`  ↳ Sugerencia: ${result.suggestedCategory}`);
  }
  console.log("---------------------------------------------------");
});