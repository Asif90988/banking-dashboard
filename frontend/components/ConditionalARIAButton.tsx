'use client'

import { usePathname } from 'next/navigation'
import ARIAFloatingButton from './aria/ARIAFloatingButton'

export default function ConditionalARIAButton() {
  const pathname = usePathname()
  
  // Don't show ARIA floating button on login page
  if (pathname === '/login') {
    return null
  }
  
  return <ARIAFloatingButton />
}
