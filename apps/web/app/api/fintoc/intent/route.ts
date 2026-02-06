import { NextResponse } from 'next/server';

const FINTOC_SECRET_KEY = process.env.FINTOC_SECRET_KEY;

export async function POST() {
  try {
    console.log('🎫 Solicitando Link Intent a Fintoc...');

    const response = await fetch('https://api.fintoc.com/v1/link_intents', {
      method: 'POST',
      headers: {
        'Authorization': FINTOC_SECRET_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product: 'movements',
        country: 'cl',
        holder_type: 'individual'
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fintoc rechazó el Intent: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Intent creado. Widget Token:', data.widget_token);
    
    // Devolvemos el widget_token al frontend
    return NextResponse.json({ widget_token: data.widget_token });

  } catch (error: any) {
    console.error('❌ Error creando intent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}