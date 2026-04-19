import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { createAdminClient } from '../../lib/supabase/admin'
import AdminView from './AdminView'

export const metadata = {
  title: 'Admin | Algee Smith',
}

export default async function AdminPage() {
  // Check current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Lock to admin email only
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  // Fetch all fans using service role
  const admin = createAdminClient()

  const { data: fans } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Stats
  const total      = fans?.length ?? 0
  const withPhone  = fans?.filter(f => f.phone)?.length ?? 0
  const thisWeek   = fans?.filter(f => {
    const d = new Date(f.created_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return d > weekAgo
  })?.length ?? 0

  return <AdminView fans={fans ?? []} stats={{ total, withPhone, thisWeek }} />
}
