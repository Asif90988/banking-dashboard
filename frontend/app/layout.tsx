import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ARIAProvider } from '../components/aria/ARIAProvider'
import ARIAAssistant from '../components/aria/ARIAAssistant'
import ARIANotifications from '../components/aria/ARIANotifications'
import ARIAInsights from '../components/aria/ARIAInsights'
import ConditionalARIAButton from '../components/ConditionalARIAButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Citi LATAM RegInsight Dashboard',
  description: 'Advanced regulatory compliance and risk management dashboard with ARIA AI Assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ARIAProvider>
          {children}
          <ARIAAssistant />
          <ARIANotifications />
          <ARIAInsights />
          <ConditionalARIAButton />
        </ARIAProvider>
      </body>
    </html>
  )
}
