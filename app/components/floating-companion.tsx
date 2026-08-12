'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedAvatar, { type AvatarMood } from './animated-avatar'

interface FloatingCompanionProps {
  mood?: AvatarMood
  speechText?: string
}

export default function FloatingCompanion({ mood: initialMood, speechText: initialSpeech }: FloatingCompanionProps) {
  const [visible, setVisible] = useState(false)
  const [mood, setMood] = useState<AvatarMood>(initialMood || 'idle')
  const [speechText, setSpeechText] = useState(initialSpeech || '')
  const [showSpeech, setShowSpeech] = useState(false)
  const lastMessageTime = useRef<number>(Date.now())
  const hasSpokenRef = useRef(false)

  useEffect(() => {
    // Mostrar después de 2 segundos de scroll
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Auto greeting after 3 seconds
  useEffect(() => {
    if (!visible || hasSpokenRef.current) return
    hasSpokenRef.current = true
    const timer = setTimeout(() => {
      setSpeechText('¡Hola! Soy NutriGuía. ¿En qué te puedo ayudar hoy? 😊')
      setShowSpeech(true)
      setMood('wave')
      setTimeout(() => {
        setShowSpeech(false)
        setMood('idle')
      }, 4000)
    }, 1500)
    return () => clearTimeout(timer)
  }, [visible])

  const handleClick = () => {
    setSpeechText('¡Presiona el chat y pregúntame lo que quieras! 🥗')
    setShowSpeech(true)
    setMood('happy')
    setTimeout(() => {
      setShowSpeech(false)
      setMood('idle')
    }, 3000)

    // Scroll to chat
    const chatSection = document.getElementById('chat')
    chatSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDoubleClick = () => {
    setSpeechText('¡Vamos a crear un plan de питание perfecto para ti! 💪')
    setShowSpeech(true)
    setMood('celebrate')
    setTimeout(() => {
      setShowSpeech(false)
      setMood('idle')
    }, 3000)
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0, x: 100 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ scale: 0, opacity: 0, x: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 z-50"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="relative">
          {/* Notification dot */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white z-10 flex items-center justify-center"
          >
            <span className="text-white text-xs">!</span>
          </motion.div>

          {/* Click hint on first visit */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-10 -right-4 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded-lg"
          >
            ¡Hola! 👋
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
          </motion.div>

          <button
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
            title="NutriGuía - Tu asistente nutricional"
          >
            <AnimatedAvatar
              size={72}
              mood={mood}
              variant="floating"
              showSpeechBubble={showSpeech}
              speechText={speechText}
              className="drop-shadow-2xl"
            />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
