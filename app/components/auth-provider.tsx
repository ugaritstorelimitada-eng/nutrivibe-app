'use client'

// Auth simulado — en producción reemplazar con Clerk o Supabase Auth
// Para static export, usamos localStorage como storage de sesión
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
