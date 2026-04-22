import { createAdminClient } from '../../../lib/supabase/admin'
import { getPlatform } from '../../../lib/platforms'
import { notFound } from 'next/navigation'
import SmartLinkView from './SmartLinkView'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const admin = createAdminClient()
  const { data } = await admin.from('smart_links').select('title, subtext, cover_art_url').eq('slug', slug).single()
  if (!data) return { title: 'Algee Smith' }
  return {
    title:       `${data.title} — Algee Smith`,
    description: data.subtext ?? 'Listen now on all platforms.',
    openGraph: {
      title:       `${data.title} — Algee Smith`,
      description: data.subtext ?? 'Listen now on all platforms.',
      images:      data.cover_art_url ? [data.cover_art_url] : [],
    },
  }
}

export default async function SmartLinkPage({ params }) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: link } = await admin
    .from('smart_links')
    .select('*, smart_link_destinations(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!link) notFound()

  // Check if scheduled and not yet live
  if (link.goes_live_at && new Date(link.goes_live_at) > new Date()) {
    return <ComingSoon link={link} />
  }

  const destinations = (link.smart_link_destinations ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(d => ({ ...d, meta: getPlatform(d.platform) }))

  // Track view server-side (fire and forget)
  admin.from('smart_links')
    .update({ view_count: (link.view_count ?? 0) + 1 })
    .eq('id', link.id)
    .then(() => {})

  return <SmartLinkView link={link} destinations={destinations} />
}

function ComingSoon({ link }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#050505', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      color: '#f5f0eb', textAlign: 'center', padding: '40px 24px',
    }}>
      {link.cover_art_url && (
        <img src={link.cover_art_url} alt={link.title}
          style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 16, marginBottom: 32, opacity: 0.6 }} />
      )}
      <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#c4222e', marginBottom: 16 }}>
        Coming Soon
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, marginBottom: 8 }}>{link.title}</h1>
      <p style={{ fontSize: 15, color: '#5a554f' }}>
        Available {new Date(link.goes_live_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  )
}
