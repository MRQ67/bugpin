'use client'

import { useState, useCallback, useRef } from 'react'
import * as nsfwjs from 'nsfwjs'
import * as tf from '@tensorflow/tfjs'

interface ModerationResult {
  isAppropriate: boolean
  confidence: number
  predictions: Record<string, number>
  blockedReason?: string
}

interface ModerationConfig {
  // Confidence thresholds for blocking content
  thresholds: {
    porn: number      // Block if confidence > 0.7
    hentai: number    // Block if confidence > 0.8
    sexy: number      // Block if confidence > 0.9 (more lenient for coding errors)
  }
}

const DEFAULT_CONFIG: ModerationConfig = {
  thresholds: {
    porn: 0.7,
    hentai: 0.8,
    sexy: 0.9
  }
}

export function useContentModeration(config: ModerationConfig = DEFAULT_CONFIG) {
  const [isLoading, setIsLoading] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modelRef = useRef<nsfwjs.NSFWJS | null>(null)

  const loadModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Set TensorFlow.js backend for better performance
      await tf.ready()
      
      // Load the NSFWJS model
      const model = await nsfwjs.load()
      modelRef.current = model
      setModelLoaded(true)
      
      return model
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content moderation model'
      setError(errorMessage)
      console.error('NSFWJS model loading error:', err)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const analyzeImage = useCallback(async (imageFile: File): Promise<ModerationResult> => {
    try {
      setIsLoading(true)
      setError(null)

      // Load model if not already loaded
      const model = await loadModel()
      if (!model) {
        throw new Error('Model not available')
      }

      // Create image element for analysis
      const img = new Image()
      const imageUrl = URL.createObjectURL(imageFile)
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            // Analyze the image
            const predictions = await model.classify(img)
            
            // Convert predictions array to object
            const predictionMap: Record<string, number> = {}
            predictions.forEach(pred => {
              predictionMap[pred.className.toLowerCase()] = pred.probability
            })

            // Check against thresholds
            let isAppropriate = true
            let blockedReason: string | undefined
            
            // Calculate confidence as the highest inappropriate content confidence
            const maxConfidence = Math.max(
              predictionMap.porn || 0,
              predictionMap.hentai || 0,
              predictionMap.sexy || 0
            )

            // Check porn content
            if (predictionMap.porn > config.thresholds.porn) {
              isAppropriate = false
              blockedReason = 'Explicit content detected'
            }

            // Check hentai content
            if (predictionMap.hentai > config.thresholds.hentai) {
              isAppropriate = false
              blockedReason = 'Inappropriate animated content detected'
            }

            // Check sexy content (more lenient)
            if (predictionMap.sexy > config.thresholds.sexy) {
              isAppropriate = false
              blockedReason = 'Suggestive content detected'
            }

            // Clean up
            URL.revokeObjectURL(imageUrl)

            resolve({
              isAppropriate,
              confidence: maxConfidence,
              predictions: predictionMap,
              blockedReason
            })
          } catch (analysisError) {
            URL.revokeObjectURL(imageUrl)
            reject(analysisError)
          }
        }

        img.onerror = () => {
          URL.revokeObjectURL(imageUrl)
          reject(new Error('Failed to load image for analysis'))
        }

        img.src = imageUrl
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Content analysis failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [config, loadModel])

  const preloadModel = useCallback(async () => {
    try {
      await loadModel()
    } catch (err) {
      // Silently fail for preloading
      console.warn('Failed to preload content moderation model:', err)
    }
  }, [loadModel])

  return {
    analyzeImage,
    preloadModel,
    isLoading,
    modelLoaded,
    error,
    clearError: () => setError(null)
  }
}