'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { runOCR } from '@/lib/ocr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

function randomName(ext: string) {
  return `${Math.random().toString(36).slice(2)}.${ext}`
}

export default function PostUploadForm() {
  const supabase = createClient()

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('')
  const [errorType, setErrorType] = useState('')
  const [tags, setTags] = useState('')
  const [ocrProgress, setOcrProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Please choose an image')
    if (!title.trim()) return alert('Please enter a title')

    setSubmitting(true)

    try {
      // Ensure user is signed in
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) throw new Error('Not authenticated')

      // 1) Upload image to Supabase Storage
      const ext = file.name.split('.').pop() || 'png'
      const filePath = `error-images/${randomName(ext)}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('uploads').getPublicUrl(filePath)

      // 2) Run OCR on client
      const { text: extracted_text } = await runOCR(file, {
        onProgress: (p) => setOcrProgress(p),
      })

      // 3) Insert post
      const { error: insertError } = await supabase.from('error_posts').insert({
        title: title.trim(),
        image_url: publicUrl,
        extracted_text,
        language: language || null,
        error_type: errorType || null,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        user_id: user.id,
      })
      if (insertError) throw insertError

      // 4) Reset
      setFile(null)
      setTitle('')
      setLanguage('')
      setErrorType('')
      setTags('')
      setPreview(null)
      setOcrProgress(0)
      alert('Post uploaded!')
    } catch (err) {
      console.error(err)
      alert('Upload failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="image">Error screenshot</Label>
        <Input id="image" type="file" accept="image/*" onChange={onFileChange} />
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-2 h-48 w-full object-contain rounded border"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Next.js build error: Module not found" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input id="language" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. TypeScript" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="errorType">Error Type</Label>
          <Input id="errorType" value={errorType} onChange={(e) => setErrorType(e.target.value)} placeholder="e.g. Build error" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. nextjs, webpack, ts" />
        </div>
      </div>

      {submitting && (
        <div className="text-sm text-muted-foreground">OCR progress: {(ocrProgress * 100).toFixed(0)}%</div>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Uploading…' : 'Upload'}
      </Button>
    </form>
  )
}
