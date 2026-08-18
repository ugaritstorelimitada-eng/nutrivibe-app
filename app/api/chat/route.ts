import { NextRequest, NextResponse } from 'next/server'

const ABACUS_BASE_URL = 'https://routellm.abacus.ai/v1'

const SYSTEM_PROMPT = `Eres **NutriVibe**, un asistente virtual experto y apasionado en alimentación saludable. Hablas en español con un tono cálido, motivador y cercano — como un nutricionista amigo que te acompaña en tu camino hacia una vida más saludable.

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
- Usa **emojis ocasionalmente** (🥗🍎💪🥤🌿🥑) para hacer la conversación más amena
- Mantén las respuestas **concisas pero informativas** (idealmente 3-5 párrafos o menos)
- Usa **listas con viñetas** cuando sea útil
- Usa **negritas** para conceptos clave

## Reglas de Seguridad
- **Nunca des diagnósticos médicos**. Si sospechas un problema de salud, sugiere consultar a un profesional.
- **Nunca recomiendes suplementos específicos** con dosis — deriva a un nutricionista/médico.`

export async function POST(req: NextRequest) {
  let messages: unknown[] = []
  try {
    const body = await req.json()
    if (Array.isArray(body.messages)) {
      messages = body.messages.filter(
        (m: unknown): m is { role: string; content: string } =>
          typeof m === 'object' && m !== null &&
          typeof (m as any).role === 'string' &&
          typeof (m as any).content === 'string'
      )
    }
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (messages.length === 0) {
    return NextResponse.json({ error: 'No se enviaron mensajes' }, { status: 400 })
  }

  const apiKey = process.env.ABACUSAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ABACUSAI_API_KEY no configurada' }, { status: 500 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        const response = await fetch(`${ABACUS_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            stream: true,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...(messages as any[]),
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        })

        if (!response.ok) {
          const errText = await response.text()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `Abacus.AI error: ${response.status} ${errText}` })}\n\n`))
          controller.close()
          return
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = (await reader?.read()) ?? { done: true, value: undefined }
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
              }
            } catch {}
          }
        }
      } catch (err: any) {
        console.error('Abacus.AI stream error:', err)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Error interno del servicio' })}\n\n`))
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
