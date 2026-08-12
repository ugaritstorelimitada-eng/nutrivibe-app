import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import type { Metadata } from 'next'
import AuthProvider from './components/auth-provider'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'NutriGuía — Tu asistente de alimentación sana',
  description: 'Consulta a NutriGuía, tu asistente inteligente para comer mejor. Recibe consejos personalizados sobre nutrición, recetas saludables y hábitos alimenticios.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'NutriGuía — Tu asistente de alimentación sana',
    description: 'Consulta a NutriGuía, tu asistente inteligente para comer mejor.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <ChunkLoadErrorHandler />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
