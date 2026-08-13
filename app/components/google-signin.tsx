'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface GoogleUser {
  id: string
  name: string
  email: string
  avatar: string
  provider: 'google'
}

interface GoogleSignInProps {
  onSuccess: (user: GoogleUser) => void
  onError?: (error: string) => void
  onGuest?: () => void
}

// Carga dinámica del script de Google Identity Services
function loadGoogleScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-gis-script')) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.id = 'google-gis-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Google Sign-In'))
    document.head.appendChild(script)
  })
}

export default function GoogleSignIn({ onSuccess, onError, onGuest }: GoogleSignInProps) {
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const tokenClientRef = useRef<any>(null)
  const callbackRef = useRef<any>(null)

  useEffect(() => {
    // Usa el client ID de la variable de entorno o uno de demo
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'

    loadGoogleScript(clientId)
      .then(() => {
        if (typeof google === 'undefined') {
          setInitError('Google Sign-In no disponible. Usa modo invitado.')
          return
        }

        tokenClientRef.current = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'profile email',
          callback: (response: any) => {
            if (response.error) {
              setLoading(false)
              onError?.(response.error)
              return
            }
            // Usar el access token para obtener perfil
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` },
            })
              .then(r => r.json())
              .then(profile => {
                const user: GoogleUser = {
                  id: `google_${profile.sub}`,
                  name: profile.name || 'Usuario Google',
                  email: profile.email || '',
                  avatar: profile.picture || '',
                  provider: 'google',
                }
                localStorage.setItem('nutriguia_user', JSON.stringify(user))
                setLoading(false)
                onSuccess(user)
              })
              .catch(() => {
                setLoading(false)
                onError?.('No se pudo obtener tu perfil de Google.')
              })
          },
        })
        setScriptLoaded(true)
      })
      .catch(() => {
        setInitError('No se pudo cargar Google Sign-In.')
      })

    return () => {
      callbackRef.current = null
    }
  }, [onSuccess, onError])

  const handleGoogleLogin = () => {
    if (!tokenClientRef.current) {
      // Fallback: modo mock para desarrollo
      handleMockGoogleLogin()
      return
    }
    setLoading(true)
    tokenClientRef.current.requestAccessToken()
  }

  const handleMockGoogleLogin = () => {
    setLoading(true)
    // Mock login para desarrollo sin Google Cloud configurado
    setTimeout(() => {
      const user: GoogleUser = {
        id: 'google_demo_' + Math.random().toString(36).slice(2, 9),
        name: 'Usuario Demo',
        email: 'demo@ejemplo.cl',
        avatar: `https://api.dicebear.com/7.x/personas/svg?seed=demo&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        provider: 'google',
      }
      localStorage.setItem('nutriguia_user', JSON.stringify(user))
      setLoading(false)
      onSuccess(user)
    }, 800)
  }

  return (
    <div className="space-y-3">
      {/* Google */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {loading ? 'Conectando...' : 'Continuar con Google'}
      </button>

      {/* Guest mode */}
      {onGuest && (
        <>
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-muted-foreground">o</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <button
            onClick={onGuest}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Usar como invitado
          </button>
        </>
      )}

      {initError && (
        <p className="text-xs text-amber-600 text-center">{initError}</p>
      )}

      {scriptLoaded && (
        <p className="text-center text-muted-foreground text-xs">
          🔒 Seguro. No almacenamos tu contraseña.
        </p>
      )}
    </div>
  )
}
