'use client'

import { usePathname } from 'next/navigation'
import DynamicFloatingDock from './dynamic-floating-dock'

export default function ConditionalFloatingDock() {
  const pathname = usePathname()
  
  // Hide floating dock on the landing page
  if (pathname === '/') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="pointer-events-auto rounded-full border bg-background/80 backdrop-blur shadow-lg px-3 py-2">
        <DynamicFloatingDock />
      </div>
    </div>
  )
}