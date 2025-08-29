import { NextResponse } from 'next/server'
import { createActionClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createActionClient()

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr) throw userErr
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    const title = String(form.get('title') || 'Untitled Error')
    const language = null // Simplified: no language selection
    const error_type = null // Simplified: no error type selection
    const tagsRaw = '' // Simplified: no tags

    if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    // Title is optional - will use default if empty

    const ext = file.name.split('.').pop() || 'png'
    const fileName = `${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `error-images/${fileName}`

    const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from('uploads').getPublicUrl(filePath)

    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const { error: insertError } = await supabase.from('error_posts').insert({
      title: title.trim(),
      image_url: publicUrl,
      language,
      error_type,
      tags,
      user_id: user.id,
    })
    if (insertError) throw insertError

    return NextResponse.json({ ok: true, image_url: publicUrl })
  } catch (e: any) {
    console.error('Upload API error', e)
    return NextResponse.json({ error: e?.message ?? 'Upload failed' }, { status: 500 })
  }
}
