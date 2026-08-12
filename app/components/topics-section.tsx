'use client'

import { motion } from 'framer-motion'
import { Droplets, Apple, ChefHat, Scale, Clock, Salad, Heart, BookOpen, MessageCircle } from 'lucide-react'

const topics = [
  {
    icon: Salad,
    title: 'Recetas saludables',
    desc: 'Ideas rápidas y nutritivas para cada comida',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    prompt: 'Dame 3 recetas saludables fáciles de preparar, una para desayuno, una para almuerzo y una para cena.',
  },
  {
    icon: Droplets,
    title: 'Hidratación',
    desc: 'Cuánta agua necesitas y cómo mantenerte hidratado',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    prompt: '¿Cuánta agua debería tomar al día? Dame consejos prácticos para mantenerme hidratado.',
  },
  {
    icon: Scale,
    title: 'Porciones',
    desc: 'Aprende a calcular las porciones adecuadas',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    prompt: '¿Cómo calculo las porciones correctas de cada grupo de alimentos? Dame ejemplos prácticos.',
  },
  {
    icon: Apple,
    title: 'Frutas y verduras',
    desc: 'Beneficios de cada alimento y cómo incluirlos',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    prompt: '¿Cuáles son las mejores frutas y verduras de temporada y cómo incorporarlas en mi dieta?',
  },
  {
    icon: Clock,
    title: 'Planificación',
    desc: 'Organiza tus comidas semanales fácilmente',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    prompt: 'Ayúdame a planificar mis comidas de la semana. Dame un ejemplo de menú semanal balanceado.',
  },
  {
    icon: Heart,
    title: 'Hábitos saludables',
    desc: 'Cambia tu relación con la comida paso a paso',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    prompt: 'Quiero mejorar mis hábitos alimenticios. Dame 5 pasos concretos y realistas para empezar.',
  },
  {
    icon: ChefHat,
    title: 'Tips de cocina',
    desc: 'Técnicas para cocinar más sano sin perder sabor',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    prompt: 'Dame 5 técnicas de cocina saludable que pueda usar todos los días.',
  },
  {
    icon: BookOpen,
    title: 'Etiquetas',
    desc: 'Aprende a interpretar la información nutricional',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    prompt: '¿Cómo leo correctamente las etiquetas nutricionales de los alimentos envasados? Dame una guía rápida.',
  },
]

export default function TopicsSection() {
  const sendToChat = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('nutriguia-chat-prompt', { detail: prompt }))
    // Scroll al chat
    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            ¿Qué puedo preguntarle?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Haz clic en cualquier tema para chatear con NutriGuía sobre eso.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map((topic: any, i: number) => {
            const Icon = topic.icon
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => sendToChat(topic.prompt)}
                className="group bg-card rounded-xl p-5 border border-border hover:border-primary/40 transition-all text-left flex flex-col gap-2"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${topic.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <MessageCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{topic.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{topic.desc}</p>
                </div>
                <div className="mt-auto pt-1">
                  <span className="text-xs text-primary/70 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Preguntar →
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
