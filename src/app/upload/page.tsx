import type { Metadata } from 'next'
import PostUploadForm from '@/components/posts/post-upload-form'

export const metadata: Metadata = {
  title: 'Upload • BugPin',
}

export default function UploadPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">Upload error screenshot</h1>
      <p className="text-muted-foreground mb-6">Add a title, attach a screenshot, and we’ll OCR the text to help others find it.</p>
      <PostUploadForm />
    </div>
  )
}
