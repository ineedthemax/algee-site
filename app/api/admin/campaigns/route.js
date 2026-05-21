import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

async function guard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user && isAdmin(user.email) ? user : null
}

export async function GET() {
  if (!await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = createAdminClient()
  const { data } = await admin.from('email_campaigns').select('*').order('created_at', { ascending: false })
  return NextResponse.json(data ?? [])
}

// POST - send campaign
export async function POST(request) {
  if (!await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { subject, body, tier_filter } = await request.json()
  if (!subject?.trim() || !body?.trim()) return NextResponse.json({ error: 'Subject and body required' }, { status: 400 })

  const admin = createAdminClient()
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Fetch fan emails
  let query = admin.from('profiles').select('email, display_name').not('email', 'is', null)
  // If tier filter, get fans by tier (join points)
  // For simplicity: send to all for now, tier filter is a label
  const { data: fans, error: fanError } = await query
  if (fanError) return NextResponse.json({ error: fanError.message }, { status: 500 })

  const emails = fans.map(f => f.email).filter(Boolean)
  if (emails.length === 0) return NextResponse.json({ error: 'No fans to send to' }, { status: 400 })

  // Save campaign record first
  const { data: campaign } = await admin.from('email_campaigns').insert({
    subject: subject.trim(),
    body: body.trim(),
    tier_filter: tier_filter ?? null,
    sent_at: new Date().toISOString(),
    recipient_count: emails.length,
  }).select().single()

  // Send in batches of 50 (Resend batch limit)
  const BATCH = 50
  let sent = 0
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH)
    try {
      await resend.batch.send(
        batch.map(email => ({
          from:    'Algee Smith <hello@thealgeesmith.com>',
          to:      email,
          subject: subject.trim(),
          html:    campaignHtml(subject.trim(), body.trim()),
        }))
      )
      sent += batch.length
    } catch (e) {
      console.error('Batch send error:', e.message)
    }
  }

  return NextResponse.json({ success: true, sent, total: emails.length, campaign })
}

function campaignHtml(subject, body) {
  // body may be HTML (from rich text editor) or plain text - handle both
  const isHtml = /<[a-z][\s\S]*>/i.test(body)
  const content = isHtml
    ? `<div style="font-size:16px;color:#8A8078;line-height:1.75;">${body}</div>`
    : body.split('\n').map(l => l.trim()
        ? `<p style="margin:0 0 16px;font-size:16px;color:#8A8078;line-height:1.75;">${l}</p>`
        : '<br/>'
      ).join('')

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <style>
    div b, div strong { color:#F5F0EB; }
    div i, div em     { color:#C4A882; }
    div u             { text-decoration-color:#C4222E; }
    div ul, div ol    { padding-left:20px; margin:0 0 16px; color:#8A8078; }
    div li            { margin-bottom:6px; line-height:1.6; }
    div font[size="2"] { font-size:13px; }
    div font[size="3"] { font-size:16px; }
    div font[size="5"] { font-size:20px; }
    div font[size="6"] { font-size:28px; font-weight:700; color:#F5F0EB; }
  </style>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;">
        <tr><td style="padding:0 0 32px;text-align:center;">
          <span style="display:inline-block;width:8px;height:8px;background:#C4222E;border-radius:50%;margin-right:10px;vertical-align:middle;"></span>
          <span style="font-size:16px;font-weight:700;color:#F5F0EB;letter-spacing:-0.3px;vertical-align:middle;">Algee Smith</span>
        </td></tr>
        <tr><td style="padding:0 0 8px;"><h1 style="margin:0;font-size:32px;font-weight:900;letter-spacing:-1.5px;color:#F5F0EB;">${subject}</h1></td></tr>
        <tr><td style="padding:16px 0 32px;">${content}</td></tr>
        <tr><td style="padding:32px 0 0;border-top:1px solid rgba(245,240,235,0.08);text-align:center;">
          <p style="margin:0;font-size:11px;color:#5A554F;letter-spacing:1px;">Algee Smith · Direct to Fan</p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`
}
