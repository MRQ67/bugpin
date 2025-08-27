import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr) throw userErr
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    const title = String(form.get('title') || '')
    const language = (form.get('language') as string) || null
    const error_type = (form.get('error_type') as string) || null
    const tagsRaw = (form.get('tags') as string) || ''
    const extracted_text = (form.get('extracted_text') as string) || null

    if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    if (!title.trim()) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

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
      extracted_text,
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
