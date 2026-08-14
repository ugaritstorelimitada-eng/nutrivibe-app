import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY no configurada. Agrega tu key de OpenAI en las variables de entorno.' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Eres un nutricionista experto. Analiza esta imagen de comida y devuelve UNICAMENTE un objeto JSON válido con esta estructura exacta — sin texto adicional, sin markdown, sin explicaciones:

{
  "food": "nombre del plato o alimentos identificados",
  "calories": número aproximado de kcal,
  "protein": número aproximado en gramos,
  "carbs": número aproximado en gramos,
  "fat": número aproximado en gramos,
  "portion": "tamaño de la porción estimada",
  "analysis": "breve consejo nutricional (máx 80 caracteres)"
}

Sé realista con las calorías. Si ves un plato grande, pon 600-900 kcal. Si ves una fruta, 80-150 kcal.
Responde SOLO con el JSON. No pongas backticks ni comentarios.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenAI vision error:', err)
      return NextResponse.json({ error: 'Error al analizar la imagen' }, { status: 500 })
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content?.trim()

    // Limpiar posibles backticks o formato
    let cleaned = raw ?? ''
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json?\n?/i, '').replace(/```$/, '').trim()
    }

    let result
    try {
      result = JSON.parse(cleaned)
    } catch {
      // Si el modelo no devolvió JSON limpio, intentar extraer
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (match) {
        try { result = JSON.parse(match[0]) } catch { /* no-op */ }
      }
      if (!result) {
        return NextResponse.json({ error: 'No pude interpretar la respuesta del modelo', raw: cleaned }, { status: 500 })
      }
    }

    // Validar campos requeridos
    if (typeof result.calories !== 'number' || typeof result.protein !== 'number') {
      return NextResponse.json({ error: 'Respuesta del modelo incompleta', raw: cleaned }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Vision route error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
