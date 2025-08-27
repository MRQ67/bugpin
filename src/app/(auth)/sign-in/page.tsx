import { Metadata } from 'next'
import SignInForm from '@/components/auth/sign-in-form'

export const metadata: Metadata = {
  title: 'Sign in • BugPin',
}

export default function SignInPage() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Welcome to BugPin</h1>
          <p className="text-muted-foreground mt-1">Pin your pain. Debug together.</p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
