import Link from 'next/link'
import { AuthButton } from '@/components/auth/auth-button'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          BugPin
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/upload" className="text-sm text-muted-foreground hover:text-foreground">
            Upload
          </Link>
          <AuthButton />
        </nav>
      </div>
    </header>
  )
}
