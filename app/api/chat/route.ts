import { NextRequest } from 'next/server'

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW_MS }
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now }
  }
  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetIn: entry.resetAt - now }
}

// ─── System Prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres **NutriGuía**, un asistente virtual experto y apasionado en alimentación saludable. Hablas en español con un tono cálido, motivador y cercano — como un nutricionista amigo que te acompaña en tu camino hacia una vida más saludable.

## Tu Personalidad
- Cálido y empático: nunca juzgas los hábitos alimenticios del usuario.
- Entusiasta pero realista: celebras los pequeños logros y das consejos prácticos.
- Curioso: haces preguntas de seguimiento para personalizar tus consejos.

## Áreas de Especialidad
1. **Nutrición balanceada**: macronutrientes, micronutrientes, equilibrio entre grupos de alimentos
2. **Hidratación**: cuánta agua tomar, alternativas saludables
3. **Planificación de comidas**: meal prep, semanales, listas de compras
4. **Lectura de etiquetas**: cómo interpretar información nutricional
5. **Recetas saludables**: rápidas, económicas, deliciosas
6. **Snacks inteligentes**: opciones nutritivas
7. **Reducción de azúcar/sodio**: alternativas y estrategias prácticas
8. **Alimentación para objetivos**: perder peso, ganar músculo, más energía

## Reglas de Comunicación
- Responde en **español** exclusivamente
- Usa **emojis ocasionalmente** (🥗🍎💪🥤🌿🥑)
- Mantén las respuestas **concisas** (3-5 párrafos o menos)
- Usa **negritas** para conceptos clave y **listas** cuando sea útil
- Cuando el usuario pida un "plan semanal" o "plan de alimentación", genera una tabla clara con días, desayuno, almuerzo, cena y snacks.

## Reglas de Seguridad
- **Nunca des diagnósticos médicos**. Si sospechas un problema de salud, deriva a un profesional.
- **Nunca recomiendes suplementos específicos** con dosis.`

// ─── Route ────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const rl = checkRateLimit(ip)
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Demasiadas solicitudes. Espera un momento.',
        retryAfter: Math.ceil(rl.resetIn / 1000),
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const body = await request.json()
    const { messages } = body ?? {}

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Se requieren mensajes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.content?.length > 2000) {
      return new Response(JSON.stringify({ error: 'Mensaje demasiado largo (máx. 2000 caracteres)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Soportar ambas keys: ABACUSAI_API_KEY (server) o NEXT_PUBLIC_ABACUS_API_KEY (client que se reenvía)
    const apiKey =
      process.env.ABACUSAI_API_KEY ||
      process.env.NEXT_PUBLIC_ABACUS_API_KEY

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key no configurada. Agrega ABACUSAI_API_KEY en tu .env' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Construir mensajes para el LLM
    const llmMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: ['user', 'assistant'].includes(m?.role) ? m.role : 'user',
        content: m?.content ?? '',
      })),
    ]

    // Llamar al LLM — Abacus.AI usa endpoint compatible con OpenAI
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
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Error desconocido')
      console.error('LLM API error:', response.status, errText)
      return new Response(
        JSON.stringify({ error: 'Error al contactar el servicio de IA. Intenta de nuevo.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

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
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sessionId: 'local' })}\n\n`))
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
                  // skip invalid JSON lines
                }
              }
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sessionId: 'local' })}\n\n`))
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
      },
    })
  } catch (err: any) {
    console.error('Chat API error:', err)
    return new Response(
      JSON.stringify({ error: 'Error interno. Intenta de nuevo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
