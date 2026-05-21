import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

// POST - notify all presave signups that a link is now live
// body: { slug }
export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await request.json()
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const admin = createAdminClient()
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { data: link } = await admin
    .from('smart_links')
    .select('id, title, slug, smart_link_destinations(*)')
    .eq('slug', slug)
    .single()

  if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })

  const { data: signups } = await admin
    .from('presave_signups')
    .select('id, email, name')
    .eq('link_id', link.id)
    .eq('notified', false)

  if (!signups?.length) return NextResponse.json({ success: true, sent: 0 })

  const linkUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.thealgeesmith.com'}/links/${slug}`

  let sent = 0
  for (const signup of signups) {
    try {
      await resend.emails.send({
        from:    'Algee Smith <hello@thealgeesmith.com>',
        to:      signup.email,
        subject: `${link.title} is out now 🔴`,
        html:    notifyHtml(link.title, linkUrl, signup.name),
      })
      await admin.from('presave_signups').update({ notified: true }).eq('id', signup.id)
      sent++
    } catch (e) {
      console.error('Notify error:', e.message)
    }
  }

  return NextResponse.json({ success: true, sent, total: signups.length })
}

function notifyHtml(title, linkUrl, name) {
  const greeting = name ? `${name},` : 'Fan,'
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px;">
    <tr><td align="center"><table width="100%" style="max-width:560px;">
      <tr><td style="padding:0 0 32px;text-align:center;">
        <span style="display:inline-block;width:8px;height:8px;background:#C4222E;border-radius:50%;margin-right:10px;vertical-align:middle;"></span>
        <span style="font-size:16px;font-weight:700;color:#F5F0EB;vertical-align:middle;">Algee Smith</span>
      </td></tr>
      <tr><td style="text-align:center;padding:0 0 24px;">
        <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C4222E;margin-bottom:12px;">Out Now</div>
        <h1 style="margin:0;font-size:48px;font-weight:900;letter-spacing:-2px;color:#F5F0EB;">${title}</h1>
      </td></tr>
      <tr><td style="padding:0 0 32px;">
        <p style="margin:0 0 16px;font-size:16px;color:#8A8078;line-height:1.75;">Hey ${greeting}</p>
        <p style="margin:0;font-size:16px;color:#8A8078;line-height:1.75;">It's out. Tap in and stream it on all platforms.</p>
      </td></tr>
      <tr><td style="text-align:center;padding:0 0 40px;">
        <a href="${linkUrl}" style="display:inline-block;padding:16px 40px;background:#C4222E;border-radius:100px;font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#F5F0EB;text-decoration:none;">
          Listen Now →
        </a>
      </td></tr>
      <tr><td style="padding:24px 0 0;border-top:1px solid rgba(245,240,235,0.08);text-align:center;">
        <p style="margin:0;font-size:11px;color:#5A554F;letter-spacing:1px;">Algee Smith · Direct to Fan</p>
      </td></tr>
    </table></td></tr>
  </table></body></html>`
}
