'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, Image as ImageIcon, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useContentModeration } from '@/hooks/use-content-moderation'
import { useOptimisticUpload } from '@/hooks/use-optimistic-upload'
import { ContentPolicyLink } from '@/components/moderation/content-policy'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

function randomName(ext: string) {
  return `${Math.random().toString(36).slice(2)}.${ext}`
}

export default function PostUploadForm() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const { analyzeImage, preloadModel, isLoading: moderationLoading, error: moderationError } = useContentModeration()
  const { uploadPost, uploadProgress, isUploading, resetUpload } = useOptimisticUpload()

  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [moderationStatus, setModerationStatus] = useState<'pending' | 'analyzing' | 'approved' | 'blocked' | null>(null)
  const [moderationMessage, setModerationMessage] = useState<string>('')
  const [showBypass, setShowBypass] = useState(false)

  // Preload the model when component mounts
  useEffect(() => {
    preloadModel()
  }, [preloadModel])

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setModerationStatus('analyzing')
    setModerationMessage('')
    setShowBypass(false)

    try {
      // Analyze the image for inappropriate content
      const result = await analyzeImage(selectedFile)
      
      if (result.isAppropriate) {
        setModerationStatus('approved')
        setModerationMessage('Image approved for upload')
      } else {
        setModerationStatus('blocked')
        setModerationMessage(result.blockedReason || 'Content may not be appropriate for this platform')
        setShowBypass(true)
      }
    } catch (error) {
      console.error('Content moderation failed:', error)
      // If moderation fails, allow upload but warn user
      setModerationStatus('approved')
      setModerationMessage('Content moderation unavailable - proceeding with upload')
    }
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      await handleFileSelect(selectedFile)
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      await handleFileSelect(droppedFile)
    }
  }

  const handleBypass = () => {
    setModerationStatus('approved')
    setModerationMessage('Upload approved by user (please ensure content follows guidelines)')
    setShowBypass(false)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert('Please select an image to upload.')
      return
    }

    if (moderationStatus === 'blocked' && showBypass) {
      alert('Please wait for content moderation to complete or address the content issue.')
      return
    }

    try {
      if (!user) throw new Error('Not authenticated')

      // Upload with optimistic feedback
      const result = await uploadPost(file, caption, user.id)

      // Reset form
      setFile(null)
      setCaption('')
      setPreview(null)
      setModerationStatus(null)
      setModerationMessage('')
      setShowBypass(false)

      // Navigate to the new post after a brief delay to show success
      setTimeout(() => {
        router.push(`/posts/${result.postId}`)
      }, 1000)
    } catch (err: any) {
      console.error('Upload failed:', err)
      // Error handling is done in the optimistic hook
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
              : moderationStatus === 'approved'
              ? 'border-green-300 bg-green-50'
              : moderationStatus === 'blocked'
              ? 'border-red-300 bg-red-50'
              : preview
              ? 'border-yellow-300 bg-yellow-50'
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
                    setModerationStatus(null)
                    setModerationMessage('')
                    setShowBypass(false)
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
        
        {/* Content Moderation Status */}
        {(moderationStatus === 'analyzing' || moderationLoading) && (
          <Alert>
            <Shield className="h-4 w-4 animate-pulse" />
            <AlertDescription>
              Checking image content... This helps keep BugPin safe and professional.
            </AlertDescription>
          </Alert>
        )}
        
        {moderationStatus === 'approved' && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {moderationMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {moderationStatus === 'blocked' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {moderationMessage}
              {showBypass && (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleBypass}
                    className="text-xs"
                  >
                    This is a coding screenshot - Continue anyway
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {moderationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Content moderation error: {moderationError}
            </AlertDescription>
          </Alert>
        )}
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

      {/* Content Policy */}
      <ContentPolicyLink />

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{uploadProgress.message}</span>
            <span className="text-sm text-muted-foreground">{uploadProgress.progress}%</span>
          </div>
          <Progress value={uploadProgress.progress} className="h-3" />
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {uploadProgress.stage === 'moderating' && 'Checking content...'}
              {uploadProgress.stage === 'uploading' && 'Uploading image...'}
              {uploadProgress.stage === 'processing' && 'Processing...'}
              {uploadProgress.stage === 'complete' && 'Upload complete!'}
            </span>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <Button 
        type="submit" 
        disabled={isUploading || !file || (moderationStatus === 'blocked' && showBypass) || moderationStatus === 'analyzing'} 
        className={cn(
          "w-full h-12 text-lg font-medium transition-all duration-200",
          uploadProgress.stage === 'complete' && "bg-green-600 hover:bg-green-700"
        )}
      >
        {isUploading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{uploadProgress.message || 'Uploading...'}</span>
          </div>
        ) : uploadProgress.stage === 'complete' ? (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Upload Complete!</span>
          </div>
        ) : moderationStatus === 'analyzing' ? (
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 animate-pulse" />
            <span>Checking Content...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Share Your Pain</span>
          </div>
        )}
      </Button>

      {/* Error State */}
      {uploadProgress.stage === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {uploadProgress.message}
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetUpload}
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </form>
  )
}