'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, Image as ImageIcon } from 'lucide-react'

function randomName(ext: string) {
  return `${Math.random().toString(36).slice(2)}.${ext}`
}

export default function PostUploadForm() {
  const router = useRouter()
  const supabase = createClient()

  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileSelect(droppedFile)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert('Please select an image to upload.')
      return
    }

    setSubmitting(true)
    try {
      // 1) Get user
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) throw new Error('Not authenticated')

      // 2) Upload image to Supabase Storage
      const ext = file.name.split('.').pop() || 'png'
      const filePath = `error-images/${randomName(ext)}`
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError

      // 3) Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      // 4) Insert post
      const { data: inserted, error: insertError } = await supabase
        .from('error_posts')
        .insert({
          title: caption.trim() || 'Untitled Error',
          image_url: publicUrl,
          language: null,
          error_type: null,
          tags: null,
          user_id: user.id,
        })
        .select('id')
        .single()

      if (insertError) throw insertError
      if (!inserted?.id) throw new Error('Failed to create post')

      // 5) Reset form
      setFile(null)
      setCaption('')
      setPreview(null)

      // 6) Navigate to the new post
      router.push(`/posts/${inserted.id}`)
    } catch (err: any) {
      console.error('Upload failed:', err)
      alert(`Upload failed: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Image Upload Area */}
      <div className="space-y-2">
        <Label>Error Screenshot</Label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : preview
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="space-y-4">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm" 
              />
              <div className="flex items-center justify-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                  }}
                >
                  Remove
                </Button>
                <Label htmlFor="file-input" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>Change Image</span>
                  </Button>
                </Label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <ImageIcon className="w-full h-full" />
              </div>
              <div>
                <Label htmlFor="file-input" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span className="flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Choose Image</span>
                    </span>
                  </Button>
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  or drag and drop your screenshot here
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )}
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Caption Area */}
      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="How does this error make you feel? huh!"
          className="min-h-[100px] resize-none"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {caption.length}/500 characters
        </p>
      </div>

      {/* Upload Button */}
      <Button 
        type="submit" 
        disabled={submitting || !file} 
        className="w-full h-12 text-lg font-medium"
      >
        {submitting ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Share Your Pain</span>
          </div>
        )}
      </Button>
    </form>
  )
}