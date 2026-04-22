import { createClient } from '../../lib/supabase/server'
import { createAdminClient } from '../../lib/supabase/admin'
import FanWall from './FanWall'

export const metadata = {
  title: 'Fan Wall — Algee Smith',
  description: 'Messages from the fans who built this.',
}

export const revalidate = 30

export default async function FanWallPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  // Fetch latest 100 approved posts
  const { data: posts } = await admin
    .from('fan_wall_posts')
    .select('id, message, display_name, city, created_at, user_id')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(100)

  // Check if current user already posted
  let userPost = null
  if (user) {
    const { data } = await admin
      .from('fan_wall_posts')
      .select('id, message, display_name, city')
      .eq('user_id', user.id)
      .eq('approved', true)
      .single()
    userPost = data ?? null
  }

  return (
    <FanWall
      posts={posts ?? []}
      currentUserId={user?.id ?? null}
      userPost={userPost}
    />
  )
}
