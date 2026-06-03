import { createAdminClient } from '../../../../lib/supabase/admin'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin':  'https://www.thealgeesmith.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Simple in-memory rate limiter: max 3 presaves per IP per 5 minutes
const rateLimitMap = new Map()
function isRateLimited(ip) {
  const now    = Date.now()
  const window = 5 * 60 * 1000  // 5 minutes
  const max    = 3
  const entry  = rateLimitMap.get(ip) ?? { count: 0, start: now }
  if (now - entry.start > window) { rateLimitMap.set(ip, { count: 1, start: now }); return false }
  if (entry.count >= max) return true
  entry.count++
  rateLimitMap.set(ip, entry)
  return false
}

// Basic email format check
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

// POST - fan signs up for a pre-save
export async function POST(request) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429, headers: CORS })
    }

    const { slug, email, name } = await request.json()
    if (!slug || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: CORS })

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400, headers: CORS })
    }

    // Limit name length to prevent abuse
    const safeName = name?.trim().slice(0, 100) || null

    const admin = createAdminClient()

    const { data: link } = await admin.from('smart_links').select('id, title, goes_live_at').eq('slug', slug).single()
    if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404, headers: CORS })

    const { error } = await admin.from('presave_signups').insert({
      link_id: link.id,
      email:   email.toLowerCase().trim(),
      name:    safeName,
    })

    // Duplicate is fine - ignore unique violation
    if (error && !error.code?.includes('23505')) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })
    }

    // Send confirmation email
    const resend = new Resend(process.env.RESEND_API_KEY)
    const releaseDate = link.goes_live_at
      ? new Date(link.goes_live_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'soon'

    await resend.emails.send({
      from:    'Algee Smith <hello@thealgeesmith.com>',
      to:      email,
      subject: `You're saved - ${link.title} drops ${releaseDate}`,
      html:    presaveConfirmHtml(link.title, releaseDate, name),
    }).catch(() => {}) // non-blocking

    return NextResponse.json({ success: true }, { headers: CORS })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS })
  }
}

function presaveConfirmHtml(title, releaseDate, name) {
  const greeting = name ? `${name},` : 'Fan,'
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px;">
    <tr><td align="center"><table width="100%" style="max-width:560px;">
      <tr><td style="padding:0 0 32px;text-align:center;">
        <span style="display:inline-block;width:8px;height:8px;background:#C4222E;border-radius:50%;margin-right:10px;vertical-align:middle;"></span>
        <span style="font-size:16px;font-weight:700;color:#F5F0EB;vertical-align:middle;">Algee Smith</span>
      </td></tr>
      <tr><td style="text-align:center;padding:0 0 24px;">
        <h1 style="margin:0;font-size:48px;font-weight:900;letter-spacing:-2px;color:#F5F0EB;line-height:1;">You're in.</h1>
      </td></tr>
      <tr><td style="padding:0 0 32px;">
        <p style="margin:0 0 16px;font-size:16px;color:#8A8078;line-height:1.75;">Hey ${greeting}</p>
        <p style="margin:0 0 16px;font-size:16px;color:#8A8078;line-height:1.75;">
          <strong style="color:#F5F0EB;">${title}</strong> drops on ${releaseDate}. You'll be the first to know when it's live.
        </p>
        <p style="margin:0;font-size:16px;color:#8A8078;line-height:1.75;">Stay locked in.</p>
      </td></tr>
      <tr><td style="padding:24px 0 0;border-top:1px solid rgba(245,240,235,0.08);text-align:center;">
        <p style="margin:0;font-size:11px;color:#5A554F;letter-spacing:1px;">Algee Smith · Direct to Fan</p>
      </td></tr>
    </table></td></tr>
  </table></body></html>`
}
