'use client'

import { useState, useEffect } from 'react'
import { PLATFORMS, slugify } from '../../lib/platforms'

const LINK_TYPES = [
  { id: 'streaming', label: 'Streaming Link', desc: 'Direct fans to listen on any DSP' },
  { id: 'presave',   label: 'Pre-Save Link',  desc: 'Fans save before release drops'   },
  { id: 'funnel',    label: 'Funnel Link',    desc: 'Collect fan info + redirect'       },
]

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function totalClicks(link) {
  return (link.smart_link_destinations ?? []).reduce((sum, d) => sum + (d.click_count ?? 0), 0)
}

function ctr(link) {
  const views  = link.view_count ?? 0
  const clicks = totalClicks(link)
  if (!views) return '—'
  return ((clicks / views) * 100).toFixed(1) + '%'
}

// ─── Smart Link Form ─────────────────────────────────────────────────────────

function SmartLinkForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title:         initial?.title        ?? '',
    slug:          initial?.slug         ?? '',
    artist:        initial?.artist       ?? 'Algee',
    subtext:       initial?.subtext      ?? '',
    cover_art_url: initial?.cover_art_url ?? '',
    theme:         initial?.theme        ?? 'dark',
    type:          initial?.type         ?? 'streaming',
    goes_live_at:  initial?.goes_live_at
      ? new Date(initial.goes_live_at).toISOString().slice(0, 16)
      : '',
    active: initial?.active ?? true,
  })

  const [destinations, setDestinations] = useState(
    (initial?.smart_link_destinations ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(d => ({ platform: d.platform, url: d.url }))
  )

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)
  const [slugEdited, setSlugEdited] = useState(!!initial)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleTitleChange = (v) => {
    set('title', v)
    if (!slugEdited) set('slug', slugify(v))
  }

  const addDestination = (platformId) => {
    if (destinations.find(d => d.platform === platformId)) return
    setDestinations(ds => [...ds, { platform: platformId, url: '' }])
  }

  const removeDestination = (i) => {
    setDestinations(ds => ds.filter((_, idx) => idx !== i))
  }

  const setDestUrl = (i, url) => {
    setDestinations(ds => ds.map((d, idx) => idx === i ? { ...d, url } : d))
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.slug.trim())  { setError('Slug is required.');  return }
    const validDests = destinations.filter(d => d.url.trim())
    if (validDests.length === 0) { setError('Add at least one platform link.'); return }

    setSaving(true)
    setError(null)
    try {
      const method = initial ? 'PATCH' : 'POST'
      const body   = {
        ...(initial ? { id: initial.id } : {}),
        ...form,
        goes_live_at: form.goes_live_at || null,
        destinations: validDests,
      }
      const res  = await fetch('/api/admin/smart-links', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onSave(json)
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  const usedPlatforms = new Set(destinations.map(d => d.platform))

  return (
    <div className="sl-form">

      {/* Type picker */}
      <div className="sl-type-row">
        {LINK_TYPES.map(t => (
          <button
            key={t.id}
            className={`sl-type-btn${form.type === t.id ? ' sl-type-active' : ''}`}
            onClick={() => set('type', t.id)}
          >
            <div className="sl-type-name">{t.label}</div>
            <div className="sl-type-desc">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Cover art URL + preview */}
      <div className="sl-cover-row">
        <div className="sl-cover-preview">
          {form.cover_art_url
            ? <img src={form.cover_art_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
            : <div className="sl-cover-empty">No art</div>
          }
        </div>
        <div style={{ flex: 1 }}>
          <label className="lm-label">Cover Art URL</label>
          <input
            className="lm-input"
            value={form.cover_art_url}
            onChange={e => set('cover_art_url', e.target.value)}
            placeholder="https://... (paste image URL)"
          />
          <div className="sl-hint">Paste a direct image URL from your distributor, Apple Music, etc.</div>
        </div>
      </div>

      {/* Title + Slug */}
      <div className="lm-form-row">
        <div className="lm-form-field lm-form-field-grow">
          <label className="lm-label">Title *</label>
          <input
            className="lm-input"
            value={form.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="e.g. Love Lost"
          />
        </div>
        <div className="lm-form-field lm-form-field-grow">
          <label className="lm-label">Slug *</label>
          <div style={{ position: 'relative' }}>
            <span className="sl-slug-prefix">algee.fan/links/</span>
            <input
              className="lm-input sl-slug-input"
              value={form.slug}
              onChange={e => { setSlugEdited(true); set('slug', slugify(e.target.value)) }}
              placeholder="love-lost"
            />
          </div>
        </div>
      </div>

      {/* Artist + Subtext */}
      <div className="lm-form-row">
        <div className="lm-form-field">
          <label className="lm-label">Artist</label>
          <input className="lm-input" value={form.artist} onChange={e => set('artist', e.target.value)} placeholder="Algee" />
        </div>
        <div className="lm-form-field lm-form-field-grow">
          <label className="lm-label">Subtext <span className="lm-optional">(optional)</span></label>
          <input className="lm-input" value={form.subtext} onChange={e => set('subtext', e.target.value)} placeholder="e.g. The wait is over. Tap in." />
        </div>
      </div>

      {/* Theme + Schedule */}
      <div className="lm-form-row">
        <div className="lm-form-field">
          <label className="lm-label">Theme</label>
          <div className="sl-theme-row">
            {['dark', 'light'].map(t => (
              <button key={t} className={`sl-theme-btn sl-theme-${t}${form.theme === t ? ' sl-theme-active' : ''}`}
                onClick={() => set('theme', t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="lm-form-field lm-form-field-grow">
          <label className="lm-label">Goes Live At <span className="lm-optional">(blank = live now)</span></label>
          <input className="lm-input" type="datetime-local" value={form.goes_live_at} onChange={e => set('goes_live_at', e.target.value)} />
        </div>
      </div>

      {/* DSP Destinations */}
      <div className="sl-section-label">Streaming Platforms</div>

      {destinations.length > 0 && (
        <div className="sl-dest-list">
          {destinations.map((d, i) => {
            const meta = PLATFORMS.find(p => p.id === d.platform)
            return (
              <div key={d.platform} className="sl-dest-row">
                <div className="sl-dest-icon" style={{ background: meta?.bg ?? '#222' }}
                  dangerouslySetInnerHTML={{ __html: meta?.icon ? `<svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="${meta.text ?? '#fff'}">${meta.icon.match(/<path[^>]*>/g)?.[0] ?? ''}</svg>` : '' }}
                />
                <span className="sl-dest-name">{meta?.label ?? d.platform}</span>
                <input
                  className="lm-input sl-dest-url"
                  value={d.url}
                  onChange={e => setDestUrl(i, e.target.value)}
                  placeholder={`${meta?.label} URL`}
                />
                <button className="sl-dest-remove" onClick={() => removeDestination(i)}>✕</button>
              </div>
            )
          })}
        </div>
      )}

      <div className="sl-platform-grid">
        {PLATFORMS.filter(p => !usedPlatforms.has(p.id)).map(p => (
          <button key={p.id} className="sl-platform-add" onClick={() => addDestination(p.id)}
            style={{ '--p-color': p.bg }}>
            <div className="sl-platform-add-icon" style={{ background: p.bg }}
              dangerouslySetInnerHTML={{ __html: `<svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="${p.text}">${p.icon?.match(/<path[^>]*>/g)?.[0] ?? ''}</svg>` }}
            />
            + {p.label}
          </button>
        ))}
      </div>

      {error && <div className="lm-error">{error}</div>}

      <div className="lm-form-actions">
        <button className="lm-btn-cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="lm-btn-save"   onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Link'}
        </button>
      </div>
    </div>
  )
}

// ─── QR Modal ────────────────────────────────────────────────────────────────

function QRModal({ slug, onClose }) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://algee-site.vercel.app'}/links/${slug}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=0f0f0f&color=f5f0eb&format=png`

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: -0.2 }}>/links/{slug}</div>
        <img src={qrSrc} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 8 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={qrSrc} download={`${slug}-qr.png`} style={{ padding: '8px 18px', background: '#c4222e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}>
            ↓ Download
          </a>
          <button onClick={onClose} style={{ padding: '8px 18px', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#888', fontSize: 12, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main LinksManager ───────────────────────────────────────────────────────

export default function LinksManager() {
  const [links,    setLinks]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [error,    setError]    = useState(null)
  const [qrSlug,   setQrSlug]   = useState(null)

  const fetchLinks = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/smart-links')
      const data = await res.json()
      setLinks(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLinks() }, [])

  const handleSaved = (link) => {
    setLinks(l => {
      const exists = l.find(x => x.id === link.id)
      return exists ? l.map(x => x.id === link.id ? link : x) : [link, ...l]
    })
    setCreating(false)
    setEditing(null)
  }

  const handleToggle = async (link) => {
    const updated = { ...link, active: !link.active }
    setLinks(l => l.map(x => x.id === link.id ? updated : x))
    await fetch('/api/admin/smart-links', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: link.id, active: !link.active }),
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this link? This cannot be undone.')) return
    setLinks(l => l.filter(x => x.id !== id))
    await fetch('/api/admin/smart-links', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/links/${slug}`)
      .then(() => alert('Link copied!'))
  }

  if (loading) return <div className="adm-loading">Loading links...</div>

  return (
    <div className="lm-wrap">
      {qrSlug && <QRModal slug={qrSlug} onClose={() => setQrSlug(null)} />}

      <div className="lm-header">
        <div>
          <div className="lm-title">Smart Links</div>
          <div className="lm-sub">{links.length} link{links.length !== 1 ? 's' : ''} · {links.filter(l => l.active).length} active</div>
        </div>
        {!creating && !editing && (
          <button className="lm-btn-new" onClick={() => setCreating(true)}>+ New Link</button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="lm-form-wrap">
          <div className="adm-section-label">New Smart Link</div>
          <SmartLinkForm onSave={handleSaved} onCancel={() => setCreating(false)} />
        </div>
      )}

      {/* Links list */}
      {links.length === 0 && !creating ? (
        <div className="adm-empty adm-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          No smart links yet. Create your first one.
        </div>
      ) : (
        <div className="lm-list">
          {links.map(link => (
            <div key={link.id} className={`lm-row${!link.active ? ' lm-row-inactive' : ''}`} style={{ flexDirection: 'column', gap: 0, padding: 0 }}>
              {editing === link.id ? (
                <div style={{ padding: 16, width: '100%' }}>
                  <SmartLinkForm initial={link} onSave={handleSaved} onCancel={() => setEditing(null)} />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', width: '100%' }}>
                  {/* Left: cover + info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    {link.cover_art_url
                      ? <img src={link.cover_art_url} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 48, height: 48, borderRadius: 8, background: '#1a1a1a', flexShrink: 0 }} />
                    }
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span className="lm-row-title" style={{ margin: 0 }}>{link.title}</span>
                        {!link.active && <span className="lm-inactive-badge">Inactive</span>}
                        {link.goes_live_at && new Date(link.goes_live_at) > new Date() && (
                          <span className="lm-featured-badge">Scheduled</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#5a554f', display: 'flex', gap: 12 }}>
                        <span>/links/{link.slug}</span>
                        <span>{link.view_count ?? 0} views</span>
                        <span>{totalClicks(link)} clicks</span>
                        <span>{ctr(link)} CTR</span>
                      </div>
                      {/* Platform dots */}
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        {(link.smart_link_destinations ?? []).sort((a,b) => a.sort_order - b.sort_order).map(d => {
                          const meta = PLATFORMS.find(p => p.id === d.platform)
                          return (
                            <div key={d.platform} title={meta?.label} style={{
                              width: 20, height: 20, borderRadius: 4,
                              background: meta?.bg ?? '#333',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                              dangerouslySetInnerHTML={{ __html: meta?.icon ? `<svg style="width:11px;height:11px" viewBox="0 0 24 24" fill="${meta.text}">${meta.icon.match(/<path[^>]*>/g)?.[0] ?? ''}</svg>` : '' }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lm-row-actions">
                    <button
                      className={`lm-toggle${link.active ? ' lm-toggle-on' : ''}`}
                      onClick={() => handleToggle(link)}
                    >
                      {link.active ? 'Live' : 'Off'}
                    </button>
                    <button className="lm-action-btn" onClick={() => copyLink(link.slug)} title="Copy link">⎘</button>
                    <button className="lm-action-btn" onClick={() => setQrSlug(link.slug)} title="QR Code">▣</button>
                    <button className="lm-action-btn" onClick={() => window.open(`/links/${link.slug}`, '_blank')} title="Preview">↗</button>
                    <button className="lm-action-btn" onClick={() => { setEditing(link.id); setCreating(false) }} title="Edit">✎</button>
                    <button className="lm-action-btn lm-action-delete" onClick={() => handleDelete(link.id)} title="Delete">✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
