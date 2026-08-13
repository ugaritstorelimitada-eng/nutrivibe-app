'use client'

import { useCallback } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface MealPlan {
  dia: string
  desayuno: string
  almuerzo: string
  cena: string
  snack: string
  notas?: string
}

interface MealPlanPDFProps {
  messages: Array<{ role: string; content: string }>
  userName?: string
  goals?: string[]
}

function parseMealPlan(content: string): MealPlan[] | null {
  // Detectar si el contenido parece un plan semanal de comidas
  const hasPlanStructure =
    content.includes('LUNES') || content.includes('lunes') ||
    content.includes('Lunes') || content.includes('MIÉRCOLES') ||
    content.includes('miercoles') || content.includes('Semana') ||
    content.includes('semana') || content.includes('| Día') ||
    (content.includes('Desayuno') && content.includes('Almuerzo'))

  if (!hasPlanStructure) return null

  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
  const days: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const plans: MealPlan[] = []
  let currentDay = 0

  for (const line of lines) {
    const dayMatch = days.find(d => line.toLowerCase().startsWith(d.toLowerCase().slice(0, 3)))
    if (dayMatch) {
      if (plans[currentDay]) currentDay++
      if (currentDay < 7) {
        plans[currentDay] = { dia: dayMatch, desayuno: '', almuerzo: '', cena: '', snack: '' }
      }
      continue
    }

    if (currentDay < 7 && plans[currentDay]) {
      const lower = line.toLowerCase()
      if (lower.startsWith('desayuno') || lower.startsWith('🌅') || lower.includes('desayuno:')) {
        plans[currentDay].desayuno = line.replace(/^[🌅🔸📋✅*\s]+(desayuno[:\s]*)?/i, '').trim()
      } else if (lower.startsWith('almuerzo') || lower.startsWith('🌞') || lower.includes('almuerzo:')) {
        plans[currentDay].almuerzo = line.replace(/^[🌞🔸📋✅*\s]+(almuerzo[:\s]*)?/i, '').trim()
      } else if (lower.startsWith('cena') || lower.startsWith('🌙') || lower.includes('cena:')) {
        plans[currentDay].cena = line.replace(/^[🌙🔸📋✅*\s]+(cena[:\s]*)?/i, '').trim()
      } else if (lower.startsWith('snack') || lower.startsWith('🍎') || lower.includes('snack:')) {
        plans[currentDay].snack = line.replace(/^[🍎🔸📋✅*\s]+(snack[:\s]*)?/i, '').trim()
      }
    }
  }

  return plans.filter(p => p.dia)
}

function generatePDFContent(plan: MealPlan[], userName: string, goals: string[]): string {
  const today = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })

  let content = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer << /Size 4 /Root 1 0 R >>
startxref
193
%%EOF`

  // Generar contenido como texto plano formateado para impresión
  let text = `\n\n`
  text += `═══════════════════════════════════════════════════\n`
  text += `          🍽️  PLAN SEMANAL DE ALIMENTACIÓN\n`
  text += `═══════════════════════════════════════════════════\n\n`
  text += `NutriGuía — ${today}\n`
  if (userName) text += `Usuario: ${userName}\n`
  if (goals.length > 0) text += `Objetivos: ${goals.join(', ')}\n`
  text += `\n───────────────────────────────────────────────────\n`

  const dayEmojis: Record<string, string> = {
    'Lunes': '🌅', 'Martes': '☀️', 'Miércoles': '🌤️', 'Jueves': '🌥️',
    'Viernes': '🌧️', 'Sábado': '🌈', 'Domingo': '🌻'
  }

  for (const day of plan) {
    const emoji = dayEmojis[day.dia] || '📅'
    text += `\n${emoji} ${day.dia.toUpperCase()}\n`
    text += `   Desayuno: ${day.desayuno || '-'}\n`
    text += `   Almuerzo:  ${day.almuerzo || '-'}\n`
    text += `   Cena:      ${day.cena || '-'}\n`
    if (day.snack) text += `   Snack:     ${day.snack}\n`
    text += `\n`
  }

  text += `───────────────────────────────────────────────────\n`
  text += `\n💧 Hidratación: Mínimo 8 vasos de agua al día\n`
  text += `🥗 Consejo: Come colores — cada color es un nutriente diferente\n`
  text += `\n⚠️ Este plan es informativo. Consulta a un nutricionista para planes personalizados.\n`
  text += `\nGenerado por NutriGuía — ${today}\n`

  return text
}

export default function MealPlanPDF({ messages, userName, goals }: MealPlanPDFProps) {
  const lastAssistantMsg = messages.filter(m => m.role === 'assistant').at(-1)
  const content = lastAssistantMsg?.content ?? ''

  const plan = parseMealPlan(content)
  if (!plan || plan.length === 0) return null

  const handleDownload = useCallback(async () => {
    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    const today = new Date().toLocaleDateString('es-CL', {
      year: 'numeric', month: 'long', day: 'numeric'
    })

    // Header
    doc.setFillColor(99, 102, 241) // primary indigo
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Plan Semanal de Alimentación', pageWidth / 2, 18, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`NutriGuía — ${today}`, pageWidth / 2, 28, { align: 'center' })
    if (userName) doc.text(`Usuario: ${userName}`, pageWidth / 2, 35, { align: 'center' })

    // Goals
    if (goals && goals.length > 0) {
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(10)
      doc.text(`🎯 ${goals.join(' · ')}`, pageWidth / 2, 48, { align: 'center' })
    }

    // Meal plan
    let y = 58
    const lineHeight = 7
    const marginLeft = 14
    const colWidth = (pageWidth - marginLeft * 2) / 4

    const dayEmojis: Record<string, string> = {
      'Lunes': 'L', 'Martes': 'M', 'Miércoles': 'X',
      'Jueves': 'J', 'Viernes': 'V', 'Sábado': 'S', 'Domingo': 'D'
    }

    const meals = [
      { key: 'dia', label: 'DÍA', bg: [99, 102, 241] },
      { key: 'desayuno', label: 'DESAYUNO', bg: [251, 191, 36] },
      { key: 'almuerzo', label: 'ALMUERZO', bg: [34, 197, 94] },
      { key: 'cena', label: 'CENA', bg: [139, 92, 246] },
      { key: 'snack', label: 'SNACK', bg: [236, 72, 153] },
    ]

    // Header row
    let x = marginLeft
    for (const meal of meals) {
      doc.setFillColor(meal.bg[0], meal.bg[1], meal.bg[2])
      doc.roundedRect(x, y - 5, colWidth, 8, 1, 1, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(meal.label, x + colWidth / 2, y, { align: 'center' })
      x += colWidth
    }

    y += 12
    doc.setFontSize(8.5)

    for (const day of plan) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }

      x = marginLeft
      const values = [
        dayEmojis[day.dia] || '?', day.dia || '-',
        (day.desayuno || '-').substring(0, 50),
        (day.almuerzo || '-').substring(0, 50),
        (day.cena || '-').substring(0, 50),
        (day.snack || '-').substring(0, 50),
      ]

      for (let i = 0; i < values.length; i++) {
        if (i === 0) {
          doc.setFillColor(240, 240, 255)
          doc.roundedRect(x, y - 4, colWidth, lineHeight, 1, 1, 'F')
        }
        doc.setTextColor(i === 0 ? 99 : 50, i === 0 ? 102 : 50, i === 0 ? 241 : 50)
        doc.setFont('helvetica', i === 0 ? 'bold' : 'normal')
        const text = values[i]
        const truncated = text.length > 28 ? text.substring(0, 26) + '…' : text
        doc.text(truncated, x + 2, y + 2)
        x += colWidth
      }
      y += lineHeight + 2
    }

    // Tips
    y += 6
    doc.setDrawColor(220, 220, 240)
    doc.line(marginLeft, y, pageWidth - marginLeft, y)
    y += 8

    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text('💧 Hidratación: Mínimo 8 vasos de agua al día', marginLeft, y)
    y += 6
    doc.text('🥗 Come colores — cada color es un nutriente diferente', marginLeft, y)
    y += 6
    doc.text('⚠️ Este plan es informativo. Consulta a un nutricionista para planes personalizados.', marginLeft, y)
    y += 10
    doc.setFontSize(8)
    doc.text(`Generado por NutriGuía — ${today}`, marginLeft, y)

    // Footer
    doc.setFontSize(7)
    doc.setTextColor(180, 180, 180)
    doc.text('nutriguia.app', pageWidth - marginLeft, 290, { align: 'right' })

    doc.save(`plan-semanal-nutriguia-${Date.now()}.pdf`)
  }, [messages, userName, goals])

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
      title="Descargar plan semanal en PDF"
    >
      <Download className="w-4 h-4" />
      Descargar PDF del plan
    </button>
  )
}
