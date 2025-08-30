import type { Metadata } from 'next'
import { ContentPolicy } from '@/components/moderation/content-policy'

export const metadata: Metadata = {
  title: 'Content Policy • BugPin',
  description: 'Content guidelines and moderation policy for BugPin'
}

export default function ContentPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ContentPolicy />
    </div>
  )
}