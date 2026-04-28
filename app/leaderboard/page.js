import { createClient } from '../../lib/supabase/server'
import { createAdminClient } from '../../lib/supabase/admin'
import { getLeaderboard, getUserPoints, getTier, getUserRank } from '../../lib/points'
import LeaderboardView from './LeaderboardView'

export const metadata = {
  title: 'Fan Leaderboard — Algee Smith',
  description: 'The top fans in the Algee Smith community.',
}

export const revalidate = 60 // refresh every 60s

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const board = await getLeaderboard(50)

  // Fan of the Month
  const admin = createAdminClient()
  const now   = new Date()
  const { data: fotmRow } = await admin
    .from('fan_of_month')
    .select('*')
    .eq('month', now.getMonth() + 1)
    .eq('year',  now.getFullYear())
    .maybeSingle()

  let myPoints = 0
  let myRank   = null
  let myTier   = null

  if (user) {
    myPoints = await getUserPoints(user.id)
    myRank   = await getUserRank(user.id)
    myTier   = getTier(myPoints)
  }

  return (
    <LeaderboardView
      board={board}
      currentUserId={user?.id ?? null}
      myPoints={myPoints}
      myRank={myRank}
      myTier={myTier}
      fanOfMonth={fotmRow ?? null}
    />
  )
}
