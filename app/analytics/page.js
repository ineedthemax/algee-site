import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import AnalyticsMetrics from '../components/AnalyticsMetrics'

export const metadata = {
  title: 'Analytics | Algee Smith',
}

export default async function AnalyticsPage() {
  // Check current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Lock to admin email only
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
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
