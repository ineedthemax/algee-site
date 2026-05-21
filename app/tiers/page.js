import { createClient } from '../../lib/supabase/server'
import { getUserPoints } from '../../lib/points'
import { TIERS, getTier, getNextTier } from '../../lib/tiers'
import TiersView from './TiersView'

export const metadata = {
  title: 'Fan Tiers - Algee Smith',
  description: 'The levels of the Algee Smith fan community.',
}

export default async function TiersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let myPoints  = 0
  let myTier    = TIERS[0]
  let nextTier  = TIERS[1]

  if (user) {
    myPoints = await getUserPoints(user.id)
    myTier   = getTier(myPoints)
    nextTier = getNextTier(myPoints)
  }

  return (
    <TiersView
      tiers={TIERS}
      currentUserId={user?.id ?? null}
      myPoints={myPoints}
      myTier={myTier}
      nextTier={nextTier}
    />
  )
}
