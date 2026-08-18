import { NextResponse } from 'next/server'

/*
 * API Route: POST /api/webhooks/mercadopago
 *
 * Mercado Pago envía notificaciones POST a esta URL cuando un pago cambia de estado.
 * Importante: necesitas verificar la firma del webhook para seguridad.
 *
 * NOTA: Esta ruta funciona SOLO en Vercel.
 *
 * Para probar webhooks en local, usa ngrok:
 *   ngrok http 3000
 *   Configura la URL de ngrok en tu panel de Mercado Pago > Webhooks
 *
 * Configurar en Vercel:
 *   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
 *   MERCADOPAGO_WEBHOOK_SECRET=xxxxx
 */

// ============================================================
// PRODUCTION: descomenta esto cuando tengas MERCADOPAGO_ACCESS_TOKEN
// ============================================================
// import { MercadoPagoConfig, Payment } from 'mercadopago'
// import { supabaseAdmin } from '@/lib/supabaseAdmin' // Cliente DB con permisos de admin
//
// const client = new MercadoPagoConfig({
//   accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
// })
//
// // Verificar firma del webhook (importante para seguridad)
// function verifyWebhookSignature(request: Request): boolean {
//   const signature = request.headers.get('x-signature')
//   const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
//   // Implementar verificación HMAC-SHA256 de la firma
//   // Por simplicidad, en producción usa la lib de Mercado Pago
//   return !!signature && !!secret
// }
//
// export async function POST(request: Request) {
//   try {
//     // Verificar firma del webhook
//     if (!verifyWebhookSignature(request)) {
//       return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
//     }
//
//     const { type, data } = await request.json()
//
//     if (type !== 'payment') {
//       return NextResponse.json({ received: true })
//     }
//
//     const paymentId = data.id
//     const paymentClient = new Payment(client)
//     const paymentData = await paymentClient.get({ id: paymentId })
//
//     if (paymentData.status === 'approved') {
//       const userId = paymentData.metadata.user_id as string
//       const planType = paymentData.metadata.plan_type as 'PRO' | 'ASESORADO'
//
//       // Actualizar plan en la base de datos
//       const { error } = await supabaseAdmin
//         .from('users')
//         .update({
//           plan: planType,
//           plan_updated_at: new Date().toISOString(),
//           is_active_subscriber: true,
//         })
//         .eq('id', userId)
//
//       if (error) throw error
//
//       console.log(`✅ Usuario ${userId} actualizado a ${planType}`)
//     }
//
//     return NextResponse.json({ received: true }, { status: 200 })
//   } catch (error) {
//     console.error('Error en webhook:', error)
//     return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
//   }
// }
// ============================================================

// TEMPORARY: mock response para static export
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body ?? {}

    if (!type || !data || !data.id) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    console.log(`Webhook recibido: type=${type}, payment_id=${data?.id}`)

    // En producción real, procesa el pago aquí
    // Por ahora solo acknowledge
    return NextResponse.json({ received: true, mock: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}
