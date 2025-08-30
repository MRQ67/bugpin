import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useOptimisticMutation } from './use-optimistic-mutation'
import { toast } from 'sonner'

export interface UploadProgress {
  stage: 'idle' | 'moderating' | 'uploading' | 'processing' | 'complete' | 'error'
  progress: number
  message: string
}

interface UploadVariables {
  file: File
  caption: string
  userId: string
}

interface UploadResult {
  postId: string
  imageUrl: string
}

export function useOptimisticUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    stage: 'idle',
    progress: 0,
    message: '',
  })

  const supabase = createClient()

  const uploadMutation = useOptimisticMutation<UploadResult, UploadVariables>({
    mutationFn: async ({ file, caption, userId }) => {
      // Stage 1: Upload image
      setUploadProgress({
        stage: 'uploading',
        progress: 25,
        message: 'Uploading image...',
      })

      const ext = file.name.split('.').pop() || 'png'
      const fileName = `${Math.random().toString(36).slice(2)}.${ext}`
      const filePath = `error-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Stage 2: Get public URL
      setUploadProgress({
        stage: 'processing',
        progress: 50,
        message: 'Processing image...',
      })

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      // Stage 3: Create post
      setUploadProgress({
        stage: 'processing',
        progress: 75,
        message: 'Creating post...',
      })

      const { data: inserted, error: insertError } = await supabase
        .from('error_posts')
        .insert({
          title: caption.trim() || 'Untitled Error',
          image_url: publicUrl,
          language: null,
          error_type: null,
          tags: null,
          user_id: userId,
        })
        .select('id')
        .single()

      if (insertError) throw insertError
      if (!inserted?.id) throw new Error('Failed to create post')

      // Stage 4: Complete
      setUploadProgress({
        stage: 'complete',
        progress: 100,
        message: 'Upload complete!',
      })

      return {
        postId: inserted.id,
        imageUrl: publicUrl,
      }
    },
    onOptimisticUpdate: ({ file, caption }) => {
      // Show immediate feedback
      setUploadProgress({
        stage: 'moderating',
        progress: 10,
        message: 'Starting upload...',
      })
    },
    onSuccess: (result) => {
      toast.success('Post uploaded successfully!')
      
      // Keep complete state briefly before resetting
      setTimeout(() => {
        setUploadProgress({
          stage: 'idle',
          progress: 0,
          message: '',
        })
      }, 2000)
    },
    onError: (error) => {
      setUploadProgress({
        stage: 'error',
        progress: 0,
        message: error.message || 'Upload failed',
      })
      
      toast.error('Upload failed. Please try again.')
      
      // Reset after showing error
      setTimeout(() => {
        setUploadProgress({
          stage: 'idle',
          progress: 0,
          message: '',
        })
      }, 3000)
    },
  })

  const uploadPost = useCallback(
    async (file: File, caption: string, userId: string) => {
      try {
        const result = await uploadMutation.mutate({ file, caption, userId })
        return result
      } catch (error) {
        // Error handling is done in the mutation hook
        throw error
      }
    },
    [uploadMutation]
  )

  const resetUpload = useCallback(() => {
    setUploadProgress({
      stage: 'idle',
      progress: 0,
      message: '',
    })
    uploadMutation.reset()
  }, [uploadMutation])

  return {
    uploadPost,
    resetUpload,
    uploadProgress,
    isUploading: uploadMutation.isLoading,
    isOptimistic: uploadMutation.isOptimistic,
    error: uploadMutation.error,
  }
}