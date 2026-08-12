import { NextResponse } from 'next/server'

/*
 * API Route: POST /api/checkout
 *
 * Recibe { userId, planType } y retorna { initPoint } con el link de pago de Mercado Pago.
 *
 * FUNCIONA EN VERCEL ( Next.js App Router estándar)
 * NO funciona en static export — para demo local, el frontend tiene fallback mock.
 *
 * Configurar en Vercel:
 *   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
 *   NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
 */

const PLAN_PRICES: Record<string, { title: string; price: number }> = {
  PRO: { title: 'NutriGuía Pro - Mensual', price: 4990 },
  ASESORADO: { title: 'NutriGuía Asesorado - Mensual', price: 14990 },
}

// ============================================================
// PRODUCTION: Código real de Mercado Pago
// Descomenta esto cuando tengas MERCADOPAGO_ACCESS_TOKEN configurado
// ============================================================

export async function POST(request: Request) {
  try {
    const { userId, planType } = await request.json()

    if (!userId || !PLAN_PRICES[planType]) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Si no hay ACCESS_TOKEN configurado, retornar mock para demo
    if (!accessToken || accessToken === 'TU_MERCADOPAGO_ACCESS_TOKEN_AQUI') {
      return NextResponse.json({
        mock: true,
        message: 'Mercado Pago no configurado — usando modo demo',
        initPoint: null,
      })
    }

    // Crear preferencia en Mercado Pago
    const plan = PLAN_PRICES[planType]

    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{
          id: planType,
          title: plan.title,
          quantity: 1,
          unit_price: plan.price,
          currency_id: 'CLP',
        }],
        metadata: {
          user_id: userId,
          plan_type: planType,
        },
        back_urls: {
          success: `${appUrl}/?checkout=success&plan=${planType}`,
          failure: `${appUrl}/?checkout=failure`,
          pending: `${appUrl}/?checkout=pending`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        payer: {
          metadata: { user_id: userId },
        },
      }),
    })

    if (!preferenceResponse.ok) {
      const errData = await preferenceResponse.json()
      console.error('Mercado Pago error:', errData)
      return NextResponse.json(
        { error: 'Error al crear preferencia de pago' },
        { status: 500 }
      )
    }

    const preference = await preferenceResponse.json()

    return NextResponse.json({
      initPoint: preference.init_point,
      preferenceId: preference.id,
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
