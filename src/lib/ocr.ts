// Tesseract.js OCR wrapper
// Runs on the client. Accepts a File or URL string. Returns extracted text.

'use client'

import Tesseract, { type WorkerOptions } from 'tesseract.js'

export type OCRResult = {
  text: string
  confidence: number
}

export async function runOCR(
  source: File | string,
  opts?: {
    lang?: string // e.g., 'eng'
    onProgress?: (p: number) => void // 0..1
    workerOptions?: WorkerOptions
  }
): Promise<OCRResult> {
  const { lang = 'eng', onProgress, workerOptions } = opts || {}

  const image = typeof source === 'string' ? source : URL.createObjectURL(source)

  try {
    const { data } = await Tesseract.recognize(image, lang, {
      logger: (m: any) => {
        if (m.status === 'recognizing text' && typeof m.progress === 'number') {
          onProgress?.(m.progress)
        }
      },
      ...(workerOptions ?? {}),
    })

    return { text: data.text ?? '', confidence: data.confidence ?? 0 }
  } finally {
    if (typeof source !== 'string') URL.revokeObjectURL(image)
  }
}
