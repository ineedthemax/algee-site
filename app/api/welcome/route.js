import { Resend } from 'resend'

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { email } = await request.json()
    if (!email) return Response.json({ error: 'Email required' }, { status: 400 })

    const { data, error } = await resend.emails.send({
      from:    'Algee Smith <hello@thealgeesmith.com>',
      to:      email,
      subject: 'Welcome to the World.',
      html:    welcomeEmail(email),
    })

    if (error) {
      console.error('Resend error:', error)
      return Response.json({ error }, { status: 500 })
    }

    return Response.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Welcome email failed:', err)
    return Response.json({ error: 'Failed to send' }, { status: 500 })
  }
}

function welcomeEmail(email) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to the World.</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 48px 0;text-align:center;">
              <span style="display:inline-block;width:8px;height:8px;background:#C4222E;border-radius:50%;margin-right:10px;vertical-align:middle;"></span>
              <span style="font-size:16px;font-weight:700;color:#F5F0EB;letter-spacing:-0.3px;vertical-align:middle;">Algee Smith</span>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:0 0 32px 0;text-align:center;">
              <h1 style="margin:0;font-size:64px;font-weight:900;line-height:0.88;letter-spacing:-3px;text-transform:uppercase;color:#F5F0EB;">
                You&rsquo;re<br />
                <span style="font-style:italic;font-weight:400;color:#C4622A;">in.</span>
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 0 32px 0;">
              <div style="height:1px;background:rgba(245,240,235,0.08);"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 0 32px 0;">
              <p style="margin:0 0 16px 0;font-size:17px;color:#8A8078;line-height:1.75;">
                Welcome to the world, fan. You&rsquo;re now part of a direct connection — no algorithm, no noise. Just Algee, direct to you.
              </p>
              <p style="margin:0;font-size:17px;color:#8A8078;line-height:1.75;">
                You&rsquo;ll be first to know about new music, film projects, merch drops, and everything in between.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 0 48px 0;text-align:center;">
              <a href="https://www.thealgeesmith.com"
                 style="display:inline-block;padding:16px 40px;background:#C4222E;border-radius:100px;font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#F5F0EB;text-decoration:none;">
                Enter the World →
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 0 32px 0;">
              <div style="height:1px;background:rgba(245,240,235,0.08);"></div>
            </td>
          </tr>

          <!-- Links -->
          <tr>
            <td style="padding:0 0 48px 0;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 16px;">
                    <a href="https://www.thealgeesmith.com/music"
                       style="font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#8A8078;text-decoration:none;">Music</a>
                  </td>
                  <td style="padding:0 16px;color:rgba(245,240,235,0.12);font-size:11px;">|</td>
                  <td style="padding:0 16px;">
                    <a href="https://www.thealgeesmith.com/film"
                       style="font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#8A8078;text-decoration:none;">Film</a>
                  </td>
                  <td style="padding:0 16px;color:rgba(245,240,235,0.12);font-size:11px;">|</td>
                  <td style="padding:0 16px;">
                    <a href="https://www.thealgeesmith.com/merch"
                       style="font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#8A8078;text-decoration:none;">Merch</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;">
              <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5A554F;">
                Algee Smith · Direct to Fan
              </p>
              <p style="margin:0;font-size:11px;color:#5A554F;line-height:1.6;">
                You're receiving this because you signed up at thealgeesmith.com<br/>
                <span style="color:#3A3530;">${email}</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}
