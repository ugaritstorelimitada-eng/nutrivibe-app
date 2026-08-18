'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

export type AvatarMood = 'idle' | 'typing' | 'happy' | 'celebrate' | 'sad' | 'thinking' | 'wave' | 'point'

interface AnimatedAvatarProps {
  size?: number
  mood?: AvatarMood
  showSpeechBubble?: boolean
  speechText?: string
  onSpeechDone?: () => void
  className?: string
  autoSpeech?: boolean
  speechDelay?: number
  variant?: 'default' | 'large' | 'floating'
  showGlow?: boolean
}

const MOOD_COLORS: Record<AvatarMood, { primary: string; glow: string }> = {
  idle: { primary: '#6366f1', glow: 'rgba(99,102,241,0.4)' },
  typing: { primary: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  happy: { primary: '#10b981', glow: 'rgba(16,185,129,0.4)' },
  celebrate: { primary: '#f97316', glow: 'rgba(249,115,22,0.5)' },
  sad: { primary: '#6b7280', glow: 'rgba(107,114,128,0.3)' },
  thinking: { primary: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
  wave: { primary: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
  point: { primary: '#06b6d4', glow: 'rgba(6,182,212,0.4)' },
}

export default function AnimatedAvatar({
  size = 56,
  mood = 'idle',
  showSpeechBubble = false,
  speechText = '',
  onSpeechDone,
  className = '',
  autoSpeech = false,
  speechDelay = 800,
  variant = 'default',
  showGlow = true,
}: AnimatedAvatarProps) {
  const [visible, setVisible] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [showBubble, setShowBubble] = useState(false)
  const typingRef = useRef(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    if (autoSpeech && speechText) {
      setShowBubble(true)
      setDisplayedText('')
      typingRef.current = true
      let i = 0
      const interval = setInterval(() => {
        if (!typingRef.current) { clearInterval(interval); return }
        setDisplayedText(speechText.slice(0, i + 1))
        i++
        if (i >= speechText.length) {
          clearInterval(interval)
          setTimeout(() => {
            setShowBubble(false)
            onSpeechDone?.()
          }, 2500)
        }
      }, 38)
      return () => { typingRef.current = false; clearInterval(interval) }
    }
  }, [autoSpeech, speechText, onSpeechDone])

  const colors = MOOD_COLORS[mood]
  const isLarge = variant === 'large'
  const isFloating = variant === 'floating'

  const svgSize = isLarge ? 200 : isFloating ? 64 : size
  const actualSize = size

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: actualSize, height: actualSize }}>
      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && speechText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 w-64"
            style={{ pointerEvents: 'none' }}
          >
            <div className="bg-white rounded-2xl rounded-bl-md shadow-xl border border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {displayedText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="ml-0.5"
                >|</motion.span>
              </p>
              <div className="absolute bottom-0 left-6 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-b border-r border-gray-100" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outer glow ring */}
      {showGlow && (
        <motion.div
          animate={
            mood === 'idle' ? { scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] } :
            mood === 'celebrate' ? { scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] } :
            mood === 'happy' ? { scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] } :
            mood === 'wave' ? { scale: [1, 1.15, 1], opacity: [0.3, 0.65, 0.3] } :
            { scale: 1, opacity: 0.35 }
          }
          transition={{ duration: mood === 'celebrate' ? 0.5 : mood === 'happy' ? 0.6 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />
      )}

      {/* Avatar card / container */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: visible ? 1 : 0, rotate: visible ? 0 : -10 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className={`relative ${isFloating ? 'cursor-pointer' : ''}`}
        style={{ width: actualSize, height: actualSize }}
      >
        {/* Floating animation */}
        <motion.div
          animate={
            mood === 'typing' ? { y: [0, -4, 0, -2, 0] } :
            mood === 'happy' ? { y: [0, -3, 0], rotate: [-2, 2, -2] } :
            mood === 'celebrate' ? { y: [0, -12, 0, -8, 0], rotate: [-8, 8, -8] } :
            mood === 'wave' ? { rotate: [0, 20, 0, 15, 0, 0] } :
            mood === 'point' ? { rotate: [-5, 5, -5] } :
            isFloating ? { y: [0, -6, 0] } :
            { y: [0, -2, 0] }
          }
          transition={{
            duration: mood === 'celebrate' ? 0.6 : mood === 'typing' ? 0.4 : mood === 'wave' ? 1.2 : isFloating ? 3 : 2.5,
            repeat: mood !== 'wave' && !isFloating ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            width={actualSize}
            height={actualSize}
            className="w-full h-full drop-shadow-xl"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
          >
            <defs>
              <radialGradient id={`grad-${mood}`} cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="white" />
                <stop offset="100%" stopColor="#f0f0ff" />
              </radialGradient>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Background circle with gradient */}
            <circle cx="50" cy="50" r={isLarge ? 47 : 46} fill={`url(#grad-${mood})`} stroke={colors.primary} strokeWidth="2.5" />

            {/* Body / torso */}
            <motion.ellipse
              cx="50" cy="74" rx="24" ry="19"
              fill={colors.primary}
              animate={mood === 'happy' || mood === 'celebrate' ? { scaleX: [1, 1.08, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.7 }}
            />

            {/* Apron / vest detail on body */}
            <ellipse cx="50" cy="74" rx="12" ry="14" fill="white" opacity="0.2" />

            {/* Head */}
            <circle cx="50" cy="40" r="21" fill="#fef3c7" />
            <circle cx="50" cy="40" r="21" fill={`url(#grad-${mood})`} opacity="0.3" />

            {/* Hair / leaves */}
            <motion.path
              d="M30 35 Q34 20 50 17 Q66 20 70 35"
              fill={colors.primary}
              animate={
                mood === 'wave' ? { d: ['M30 35 Q34 20 50 17 Q66 20 70 35', 'M25 30 Q34 18 50 15 Q66 18 72 30', 'M30 35 Q34 20 50 17 Q66 20 70 35'] } :
                mood === 'celebrate' ? { d: ['M30 35 Q34 20 50 17 Q66 20 70 35', 'M28 30 Q34 15 50 12 Q66 15 72 30', 'M30 35 Q34 20 50 17 Q66 20 70 35'] } :
                {}
              }
              transition={{ repeat: Infinity, duration: 0.8 }}
            />

            {/* Leaf accessory */}
            <motion.path
              d="M70 28 Q82 22 78 33 Q74 41 70 36"
              fill="#22c55e"
              animate={
                isFloating ? { rotate: [-5, 5, -5], transformOrigin: '70px 38px' } :
                mood === 'idle' ? { rotate: [-3, 3, -3], transformOrigin: '70px 38px' } :
                mood === 'happy' ? { rotate: [-8, 8, -8], transformOrigin: '70px 38px' } :
                {}
              }
              transition={{ repeat: Infinity, duration: isFloating ? 2.5 : 3, ease: 'easeInOut' }}
            />

            {/* Eyes */}
            {mood === 'sad' ? (
              <>
                <path d="M38 40 L48 38" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M62 40 L52 38" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : mood === 'thinking' ? (
              <>
                <motion.circle cx="43" cy="39" r="3.5" fill="#1f2937" animate={{ cx: [43, 44.5, 43] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                <motion.circle cx="57" cy="39" r="3.5" fill="#1f2937" animate={{ cx: [57, 55.5, 57] }} transition={{ repeat: Infinity, duration: 1.5 }} />
              </>
            ) : (
              <>
                <circle cx="43" cy="39" r="3.5" fill="#1f2937" />
                <circle cx="57" cy="39" r="3.5" fill="#1f2937" />
              </>
            )}

            {/* Eye shine */}
            <circle cx="44.5" cy="38" r="1.3" fill="white" />
            <circle cx="58.5" cy="38" r="1.3" fill="white" />

            {/* Blush for happy */}
            {(mood === 'happy' || mood === 'celebrate' || mood === 'wave') && (
              <>
                <ellipse cx="35" cy="44" rx="5" ry="3" fill="#fca5a5" opacity="0.5" />
                <ellipse cx="65" cy="44" rx="5" ry="3" fill="#fca5a5" opacity="0.5" />
              </>
            )}

            {/* Mouth */}
            {mood === 'happy' || mood === 'celebrate' ? (
              <motion.path
                d="M42 49 Q50 58 58 49"
                stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round"
                animate={mood === 'celebrate' ? { d: ['M42 49 Q50 58 58 49', 'M40 47 Q50 60 60 47', 'M42 49 Q50 58 58 49'] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            ) : mood === 'sad' ? (
              <path d="M43 53 Q50 47 57 53" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : mood === 'typing' ? (
              <>
                <circle cx="44" cy="50" r="1.5" fill="#1f2937" />
                <motion.circle cx="50" cy="50" r="1.5" fill="#1f2937" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                <circle cx="56" cy="50" r="1.5" fill="#1f2937" />
              </>
            ) : mood === 'wave' ? (
              <motion.path d="M41 49 Q50 56 59 49" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round"
                animate={{ d: ['M41 49 Q50 56 59 49', 'M41 49 Q50 58 59 49', 'M41 49 Q50 56 59 49'] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
            ) : (
              <path d="M43 50 Q50 53 57 50" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            )}

            {/* Sparkles for celebrate */}
            {mood === 'celebrate' && (
              <motion.g animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.6 }}>
                <text x="16" y="26" fontSize="10">✨</text>
                <text x="76" y="26" fontSize="10">✨</text>
                <text x="48" y="12" fontSize="8">⭐</text>
                <text x="78" y="50" fontSize="7">✨</text>
                <text x="18" y="50" fontSize="7">✨</text>
              </motion.g>
            )}

            {/* Stars for wave */}
            {mood === 'wave' && (
              <motion.g animate={{ opacity: [0, 1, 0], rotate: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}>
                <text x="75" y="25" fontSize="8">💫</text>
                <text x="20" y="30" fontSize="6">✨</text>
              </motion.g>
            )}

            {/* Necklace / accessory */}
            <circle cx="50" cy="63" r="3" fill={colors.primary} opacity="0.6" />
            <circle cx="50" cy="63" r="1.5" fill="white" opacity="0.8" />

            {/* Clipboard in hand (hint of nutrition assistant) */}
            <rect x="70" y="65" width="12" height="16" rx="2" fill="white" opacity="0.9" />
            <rect x="72" y="68" width="8" height="1.5" rx="0.5" fill={colors.primary} opacity="0.4" />
            <rect x="72" y="71" width="6" height="1.5" rx="0.5" fill={colors.primary} opacity="0.4" />
            <rect x="72" y="74" width="7" height="1.5" rx="0.5" fill={colors.primary} opacity="0.4" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}
