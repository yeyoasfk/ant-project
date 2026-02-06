import { NextResponse } from 'next/server';

// 👇 MODO SIMULACIÓN (Bypass de OpenAI por falta de cupo)
export async function POST() {
  try {
    console.log("🐜 Iniciando análisis simulado...");

    // 1. Simulamos que la IA está "pensando" (espera 1.5 segundos)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Lista de consejos pre-fabricados (La "IA" enlatada)
    const consejos = [
        "🐜 Veo mucho Starbucks y poco ahorro. Hazte el café en casa y compra acciones con la diferencia.",
        "🐜 ¿Uber Eats otra vez? Tus finanzas están gritando ayuda. Cocina algo, humano flojo.",
        "🐜 Detecto gastos hormiga nivel Dios. Si sigues así, vivirás en un hormiguero de verdad.",
        "🐜 Ese 'gasto necesario' en realidad fue un capricho. La hormiga lo sabe todo. Ahorra.",
        "🐜 Tienes fugas de dinero en snacks. Cierra la boca y abre la cuenta de ahorro.",
        "🐜 Gastaste en 3 días lo que una hormiga gasta en 3 vidas. ¡Contrólate!",
        "🐜 ¿Realmente necesitabas esa suscripción? Cancélala antes de que te cancele a ti."
    ];

    // 3. Elegir uno al azar
    const advice = consejos[Math.floor(Math.random() * consejos.length)];

    console.log("✅ Consejo generado:", advice);
    return NextResponse.json({ advice });

  } catch (error: any) {
    console.error("❌ Error en simulación:", error);
    return NextResponse.json({ error: 'Error simulado' }, { status: 500 });
  }
}