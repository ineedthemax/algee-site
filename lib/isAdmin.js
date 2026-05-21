// Central admin check - supports comma-separated ADMIN_EMAIL env var
// e.g. ADMIN_EMAIL=algeesmith@gmail.com,ineedthemax05@gmail.com

export function isAdmin(email) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.toLowerCase().trim())
}
