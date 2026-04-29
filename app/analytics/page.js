import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { isAdmin } from '../../lib/isAdmin'
import AnalyticsMetrics from '../components/AnalyticsMetrics'

export const metadata = {
  title: 'Analytics | Algee Smith',
}

export default async function AnalyticsPage() {
  // Check current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Lock to admin only
  if (!user || !isAdmin(user.email)) {
    redirect('/')
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics</h1>
        <p>Live metrics across platforms</p>
      </div>
      <AnalyticsMetrics />
    </div>
  )
}
