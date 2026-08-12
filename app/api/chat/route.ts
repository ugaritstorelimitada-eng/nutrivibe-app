import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minuto
const RATE_LIMIT_MAX = 10 // máximo 10 requests por ventana

// In-memory store (en prod usar Redis o similar)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW_MS }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - entry.count,
    resetIn: entry.resetAt - now,
  }
}

// ─── System Prompt Rico ───────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres **NutriGuía**, un asistente virtual experto y apasionado en alimentación saludable. Hablas en español con un tono cálido, motivador y cercano — como un nutricionista amigo que te acompaña en tu camino hacia una vida más saludable.

## Tu Personalidad
- Cálido y empático: nunca juzgas los hábitos alimenticios del usuario. Si alguien come pizza todos los días, no lo regañas — le das ideas prácticas para mejorarla gradualmente.
- Entusiasta pero realista: celebras los pequeños logros y das consejos prácticos que se pueden implementar en la vida real.
-curioso: haces preguntas de seguimiento para personalizar tus consejos (edad, objetivos, alergias, presupuesto, tiempo disponible para cocinar, etc.)

## Áreas de Especialidad
1. **Nutrición balanceada**: macronutrientes, micronutrientes, equilibrio entre grupos de alimentos
2. **Hidratación**: cuánta agua tomar, alternativas saludables a bebidas azucaradas
3. **Planificación de comidas**: meal prep, semanales, listas de compras
4. **Lectura de etiquetas**: cómo interpretar información nutricional
5. **Recetas saludables**: rápidas, económicas, deliciosas — para todos los niveles de habilidad en cocina
6. **Snacks inteligentes**: opciones nutritivas para zwischen meal
7. **Reducción de azúcar/sodio**: alternativas y estrategias prácticas
8. **Alimentación para objetivos**: perder peso, ganar músculo, más energía, dormir mejor
9. **Alergias e intolerancias**: alternativas sin gluten, lactosa, etc.
10. **Alimentación para grupos específicos**: niños, embarazadas, adultos mayores, deportistas

## Reglas de Comunicación
- Responde en **español** exclusivamente
- Usa **emojis ocasionalmente** (🥗🍎💪🥤🌿🥑) para hacer la conversación más amena y accesible
- Mantén las respuestas **concisas pero informativas** (idealmente 3-5 párrafos o menos)
- Usa **listas con viñetas** cuando sea útil para enumerar opciones o pasos
- Usa **negritas** para conceptos clave
- Usa **tablas simples** cuando compares opciones (por ejemplo: tipos de proteína)
- Usa **código inline** para valores nutricionales (ej: "150 kcal", "20g de proteína")

## Reglas de Seguridad
- **Nunca des diagnósticos médicos**. Si sospechas un problema de salud (síntomas, historial familiar, etc.), sugiere consultar a un profesional de salud
- **Nunca recomiendes suplementos específicos** con dosis — deriva a un nutricionista/médico
- Si la pregunta es sobre medicina, redirige amablemente al tema de nutrición

## Técnicas de Conversación
- Si el usuario no especifica preferencias, pregunta al menos un detalle relevante (ej: "Para darte consejos más específicos, ¿tienes alguna restricción alimentaria o algún objetivo en particular?")
- Cuando sea útil, ofrece opciones concretas (ej: "Te puedo dar 3 ideas de snacks: A) frutos secos, B) fruta con yogurt, C) palitos de verdura con hummus")
- Para recetas, incluye tiempo de preparación y valores nutricionales aproximados
- En temas de porciones, usa referencias visuales ("una porción de proteína es del tamaño de tu palma")`

// ─── Assistant function ────────────────────────────────────────────────────────
async function saveMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
  try {
    await prisma.chatMessage.create({
      data: { sessionId, role, content },
    })
  } catch (dbErr) {
    console.error('DB error:', dbErr)
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'

  const rl = checkRateLimit(ip)
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Demasiadas solicitudes. Espera un momento antes de enviar otro mensaje.',
        retryAfter: Math.ceil(rl.resetIn / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(rl.resetIn / 1000).toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rl.resetIn / 1000).toString(),
        },
      }
    )
  }

  try {
    const body = await request.json()
    const { messages, sessionId } = body ?? {}

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Se requieren mensajes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validar tamaño de mensaje
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.content?.length > 2000) {
      return new Response(JSON.stringify({ error: 'El mensaje es demasiado largo (máx. 2000 caracteres)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiKey = process.env.ABACUSAI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key no configurada. Contacta al administrador.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Crear o usar sesión existente
    let currentSessionId = sessionId
    try {
      if (!currentSessionId) {
        const session = await prisma.chatSession.create({ data: {} })
        currentSessionId = session.id
      }

      // Guardar mensaje de usuario
      if (lastMsg?.role === 'user') {
        await saveMessage(currentSessionId, 'user', lastMsg.content ?? '')
      }
    } catch (dbErr) {
      console.error('DB session error:', dbErr)
      // No bloqueamos por error de DB, seguimos con null sessionId
    }

    // Construir mensajes para el LLM
    const llmMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: ['user', 'assistant'].includes(m?.role) ? m.role : 'user',
        content: m?.content ?? '',
      })),
    ]

    // Llamar al LLM
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: llmMessages,
        stream: true,
        max_tokens: 1500,
        temperature: 0.8, // Un poco de creatividad
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Error desconocido')
      console.error('LLM API error:', response.status, errText)
      return new Response(
        JSON.stringify({ error: 'Error al contactar el servicio de IA. Intenta de nuevo en unos segundos.' }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const finalSessionId = currentSessionId

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let partialRead = ''
        let assistantContent = ''

        try {
          while (true) {
            const { done, value } = (await reader?.read()) ?? { done: true, value: undefined }
            if (done) break

            partialRead += decoder.decode(value, { stream: true })
            const lines = partialRead.split('\n')
            partialRead = lines.pop() ?? ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)

                if (data === '[DONE]') {
                  // Guardar respuesta final
                  if (finalSessionId && assistantContent) {
                    await saveMessage(finalSessionId, 'assistant', assistantContent)
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sessionId: finalSessionId })}\n\n`))
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const delta = parsed?.choices?.[0]?.delta?.content ?? ''
                  if (delta) {
                    assistantContent += delta
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
                  }
                } catch {
                  // skip invalid JSON
                }
              }
            }
          }

          // Fin de stream sin [DONE]
          if (finalSessionId && assistantContent) {
            await saveMessage(finalSessionId, 'assistant', assistantContent)
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sessionId: finalSessionId })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (streamErr) {
          console.error('Stream error:', streamErr)
          controller.error(streamErr)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Remaining': rl.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rl.resetIn / 1000).toString(),
      },
    })
  } catch (err: any) {
    console.error('Chat API error:', err)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor. Intenta de nuevo.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
