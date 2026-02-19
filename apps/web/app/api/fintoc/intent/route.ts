import { NextResponse } from 'next/server';

const FINTOC_SECRET_KEY = process.env.FINTOC_SECRET_KEY;

export async function POST() {
  try {
    // 🛡️ VALIDACIÓN
    if (!FINTOC_SECRET_KEY) {
      console.error('❌ [Fintoc Intent] FINTOC_SECRET_KEY no está definida');
      return NextResponse.json({ error: 'FINTOC_SECRET_KEY no configurada' }, { status: 500 });
    }

    console.log('🔍 [Fintoc Intent] Creando link intent...');
    
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

    console.log('📊 [Fintoc Intent] Response status:', response.status);

    if (response.status === 403) {
      const errorText = await response.text();
      console.error('❌ [Fintoc Intent] ERROR 403 - Forbidden:', errorText);
      return NextResponse.json({ 
        error: 'Error de autenticación con Fintoc (403). Verifica tu API key.' 
      }, { status: 403 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Fintoc Intent] Error ${response.status}:`, errorText);
      throw new Error(errorText);
    }

    const data = await response.json();
    const widgetToken = data.widget_token ?? data.widgetToken;
    
    if (!widgetToken) {
      console.error('❌ [Fintoc Intent] La API no devolvió widget_token. Respuesta:', JSON.stringify(data));
      return NextResponse.json({ error: 'Fintoc no devolvió widget_token' }, { status: 500 });
    }
    
    console.log('✅ [Fintoc Intent] Link intent creado. widget_token:', widgetToken.substring(0, 25) + '...');
    return NextResponse.json({ widget_token: widgetToken });

  } catch (error: any) {
    console.error('❌ [Fintoc Intent] Error crítico:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}