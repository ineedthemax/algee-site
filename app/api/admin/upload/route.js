import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'File type not supported' }, { status: 400 })
  }

  const ext      = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const folder   = file.type.startsWith('video') ? 'videos' : 'images'
  const path     = `campaign-media/${folder}/${filename}`

  const bytes  = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const admin = createAdminClient()

  // Ensure bucket exists
  await admin.storage.createBucket('campaign-media', { public: true }).catch(() => {})

  const { error: uploadError } = await admin.storage
    .from('campaign-media')
    .upload(`${folder}/${filename}`, buffer, {
      contentType:  file.type,
      cacheControl: '3600',
      upsert:       false,
    })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage
    .from('campaign-media')
    .getPublicUrl(`${folder}/${filename}`)

  return NextResponse.json({ url: publicUrl, type: file.type.startsWith('video') ? 'video' : 'image' })
}
