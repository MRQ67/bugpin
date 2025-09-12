'use client'

import { usePathname } from 'next/navigation'

export default function ConditionalContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Remove bottom padding on landing page since no floating dock
  const paddingClass = pathname === '/' ? '' : 'pb-20'

  return (
    <div className={paddingClass}>
      {children}
    </div>
  )
}