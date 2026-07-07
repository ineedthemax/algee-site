import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin':  'https://www.thealgeesmith.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function POST(request) {
  try {
    const { email, name } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400, headers: CORS })

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from:    'Algee Smith <hello@thealgeesmith.com>',
      to:      email,
      subject: 'OTW is out now.',
      html:    confirmHtml(name),
    })

    return NextResponse.json({ success: true }, { headers: CORS })
  } catch {
    // Non-blocking — email failure doesn't affect signup
    return NextResponse.json({ success: true }, { headers: CORS })
  }
}

function confirmHtml(name) {
  const greeting = name ? `${name},` : 'Fan,'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>OTW is out now.</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="padding:0 0 48px;text-align:center;">
          <span style="display:inline-block;width:8px;height:8px;background:#C4222E;border-radius:50%;margin-right:10px;vertical-align:middle;"></span>
          <span style="font-size:16px;font-weight:700;color:#F5F0EB;letter-spacing:-0.3px;vertical-align:middle;">Algee Smith</span>
        </td></tr>

        <!-- Hero -->
        <tr><td style="padding:0 0 8px;text-align:center;">
          <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C4222E;margin-bottom:16px;">Out Now</div>
          <h1 style="margin:0;font-size:72px;font-weight:900;line-height:0.9;letter-spacing:-4px;text-transform:uppercase;color:#F5F0EB;">OTW</h1>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:32px 0;">
          <div style="height:1px;background:rgba(245,240,235,0.08);"></div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:0 0 32px;">
          <p style="margin:0 0 16px;font-size:17px;color:#8A8078;line-height:1.75;">Hey ${greeting}</p>
          <p style="margin:0 0 16px;font-size:17px;color:#8A8078;line-height:1.75;">
            You signed up and the song is already out. Stream it now on all platforms.
          </p>
          <p style="margin:0;font-size:17px;color:#8A8078;line-height:1.75;">You're on the way.</p>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 0 48px;text-align:center;">
          <a href="https://lnk.to/otwsong"
             style="display:inline-block;padding:16px 40px;background:#C4222E;border-radius:100px;font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#F5F0EB;text-decoration:none;">
            Listen Now →
          </a>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 0 32px;">
          <div style="height:1px;background:rgba(245,240,235,0.08);"></div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5A554F;">Algee Smith · Direct to Fan</p>
          <p style="margin:0;font-size:11px;color:#5A554F;line-height:1.6;">
            You're receiving this because you signed up at thealgeesmith.com/otw
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
