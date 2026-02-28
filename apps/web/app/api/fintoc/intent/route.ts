import { NextResponse } from 'next/server';

const FINTOC_SECRET_KEY = process.env.FINTOC_SECRET_KEY;

export async function POST() {
  try {
    // 🛡️ VALIDACIÓN
    if (!FINTOC_SECRET_KEY) {
      console.error('❌ [Fintoc Intent] FINTOC_SECRET_KEY no está definida');
      return NextResponse.json({ error: 'FINTOC_SECRET_KEY no configurada' }, { status: 500 });
    }

    console.log('� [PASO 1] [Backend] Llamando a https://api.fintoc.com/v1/link_intents...');
    
    // Pedimos a Fintoc un "Link Intent"
    const response = await fetch('https://api.fintoc.com/v1/link_intents', {
      method: 'POST',
      headers: {
        'Authorization': FINTOC_SECRET_KEY, // Fintoc requiere solo la key, sin "Bearer"
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product: 'movements',
        country: 'cl',
        holder_type: 'individual'
      })
    });

    console.log('📊 [PASO 1] [Backend] Respuesta de Fintoc - Status:', response.status);

    if (response.status === 403) {
      const errorText = await response.text();
      console.error('❌ [PASO 1] [Backend] ERROR 403 - Forbidden:', errorText);
      return NextResponse.json({ 
        error: 'Error de autenticación con Fintoc (403). Verifica tu FINTOC_SECRET_KEY.' 
      }, { status: 403 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [PASO 1] [Backend] Error HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // 🔍 Log DETALLADO de la respuesta de Fintoc
    console.log('📋 [PASO 1] [Backend] ===== RESPUESTA COMPLETA DE FINTOC =====');
    console.log('Todas las propiedades:', Object.keys(data));
    console.log('Respuesta JSON:', JSON.stringify(data, null, 2));
    
    // Buscar widget_token en múltiples formatos
    const widgetToken = data.widget_token || data.widgetToken || data.widgettoken;
    const intentId = data.id;
    
    console.log('🔍 [PASO 1] [Backend] Búsqueda de tokens:');
    console.log(`   - widget_token (snake_case): ${data.widget_token}`);
    console.log(`   - widgetToken (camelCase): ${data.widgetToken}`);
    console.log(`   - widgettoken (lowercase): ${data.widgettoken}`);
    console.log(`   - id (intent ID): ${data.id}`);
    console.log(`   - widget_token final: ${widgetToken}`);
    
    if (!widgetToken) {
      console.error('❌ [PASO 1] [Backend] CRITICAL: widget_token no encontrado en ningún formato');
      console.error('📋 [PASO 1] [Backend] Respuesta completa:', JSON.stringify(data));
      return NextResponse.json({ 
        error: 'Fintoc no devolvió widget_token en ningún formato',
        details: data,
        keysReceived: Object.keys(data)
      }, { status: 500 });
    }
    
    if (!intentId) {
      console.warn('⚠️ [PASO 1] [Backend] La API no devolvió id del intent');
    }
    
    console.log('✅ [PASO 1] [Backend] Link intent creado exitosamente:');
    console.log(`   - widget_token: ${widgetToken.substring(0, 30)}...`);
    console.log(`   - Comienza con "li_": ${widgetToken.startsWith('li_')}`);
    console.log(`   - Comienza con "link_": ${widgetToken.startsWith('link_')}`);
    if (intentId) {
      console.log(`   - intent id: ${intentId.substring(0, 30)}...`);
    }
    
    // Respuesta al frontend
    const responseData = { 
      widget_token: widgetToken,
      widgetToken: widgetToken, // Compatibilidad camelCase
      id: intentId,
      intentId: intentId, // Compatibilidad camelCase
      ...data // Devolver toda la respuesta de Fintoc
    };
    
    console.log('📤 [PASO 1] [Backend] Devolviendo al frontend:', Object.keys(responseData));
    
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('❌ [PASO 1] [Backend] ERROR CRÍTICO:', error.message);
    console.error('📋 [PASO 1] [Backend] Stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}