'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('')
  const [errorType, setErrorType] = useState('')
  const [tags, setTags] = useState('')
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'starting' | 'running' | 'done' | 'error'>('idle')
  const [ocrText, setOcrText] = useState('')
  const ocrPromiseRef = useRef<Promise<string> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
    setOcrText('')
    setOcrProgress(0)
    setOcrStatus('idle')

    // Kick off OCR early to reduce perceived wait on submit
    if (f) {
      setOcrStatus('starting')
      const p = (async () => {
        try {
          const { text } = await runOCR(f, {
            onProgress: (p) => {
              // First progress events may come only after worker/core loads
              setOcrStatus('running')
              setOcrProgress(p)
            },
          })
          setOcrText(text)
          setOcrStatus('done')
          return text
        } catch (err) {
          console.error('OCR failed', err)
          setOcrStatus('error')
          return ''
        } finally {
          ocrPromiseRef.current = null
        }
      })()
      ocrPromiseRef.current = p
    } else {
      ocrPromiseRef.current = null
    }
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

      // 2) Use OCR result. If not finished yet, wait for the in-flight OCR.
      let extracted_text = ocrText
      if (!extracted_text) {
        if (ocrPromiseRef.current) {
          setOcrStatus('running')
          extracted_text = await ocrPromiseRef.current
        } else {
          // Fallback: run OCR now
          setOcrStatus('starting')
          const { text } = await runOCR(file, {
            onProgress: (p) => setOcrProgress(p),
          })
          extracted_text = text
          setOcrStatus('done')
        }
      }

      // 3) Insert post and get its id
      const { data: inserted, error: insertError } = await supabase
        .from('error_posts')
        .insert({
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
        .select('id')
        .single()
      if (insertError) throw insertError

      // 4) Reset
      setFile(null)
      setTitle('')
      setLanguage('')
      setErrorType('')
      setTags('')
      setPreview(null)
      setOcrProgress(0)
      setOcrStatus('idle')
      setOcrText('')
      // Navigate to the new post for immediate feedback
      if (inserted?.id) {
        router.push(`/posts/${inserted.id}`)
      } else {
        alert('Post uploaded!')
      }
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

      <div className="text-sm text-muted-foreground min-h-5">
        {ocrStatus === 'starting' && 'Preparing OCR worker…'}
        {ocrStatus === 'running' && `OCR progress: ${(ocrProgress * 100).toFixed(0)}%`}
        {ocrStatus === 'done' && 'OCR complete'}
        {ocrStatus === 'error' && 'OCR failed. You can still submit without extracted text.'}
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Uploading…' : 'Upload'}
      </Button>
    </form>
  )
}
