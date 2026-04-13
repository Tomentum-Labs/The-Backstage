import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body ?? {};

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id        SERIAL PRIMARY KEY,
        email     TEXT UNIQUE NOT NULL,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    const rows = await sql`
      INSERT INTO waitlist (email)
      VALUES (${normalizedEmail})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;

    // Already on list — still return success so we don't leak membership
    if (rows.length === 0) {
      return res.status(200).json({ success: true });
    }

    await resend.emails.send({
      from: 'no-reply@send.thebkstg.com',
      to: normalizedEmail,
      subject: "You're on The Backstage waitlist",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the waitlist</title>
</head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

          <!-- Logo / wordmark -->
          <tr>
            <td style="padding-bottom:40px;">
              <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">The Backstage</span>
            </td>
          </tr>

          <!-- Hero text -->
          <tr>
            <td style="padding-bottom:24px;">
              <h1 style="margin:0;font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-1px;">
                You're on<br/>
                <span style="color:#c9f564;">the list.</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-bottom:16px;">
              <p style="margin:0;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.65);">
                Thanks for joining the waitlist. We'll reach out as soon as your access is ready — expect product updates, early feature previews, and a front-row seat to what we're building.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:40px;">
              <p style="margin:0;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.65);">
                In the meantime, sit tight. Something exciting is coming.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.1);padding-top:24px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">
                The Backstage &nbsp;·&nbsp; No spam. Product updates only.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[waitlist]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
