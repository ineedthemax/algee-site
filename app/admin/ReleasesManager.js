'use client'
import { useState, useEffect } from 'react'

const CONTENT_TYPES = [
  { value: 'video',    label: '🎬 Video',    hint: 'Paste a video URL or upload link' },
  { value: 'audio',    label: '🎵 Audio',    hint: 'Bonus track, demo, instrumental' },
  { value: 'gallery',  label: '🖼 Gallery',  hint: 'Paste image URL' },
  { value: 'document', label: '📄 Document', hint: 'PDF or download link' },
  { value: 'event',    label: '🎟 Event',    hint: 'Livestream, Q&A, meetup' },
  { value: 'merch',    label: '👕 Merch',    hint: 'Tee, vinyl, limited item' },
]

const TYPE_COLORS = { video: '#c4222e', audio: '#1db954', gallery: '#e1306c', document: '#4a90d9', event: '#e8a020', merch: '#9b59b6' }

function ContentTypeIcon({ type }) {
  return CONTENT_TYPES.find(t => t.value === type)?.label?.split(' ')[0] ?? '📦'
}

// ── Add Content Form ──────────────────────────────────────────────────────────
function AddContentForm({ releaseId, tierId, onAdd, onCancel }) {
  const [form, setForm] = useState({ type: 'video', title: '', description: '', url: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError(null)
    const res = await fetch(`/api/admin/releases/${releaseId}/tiers/${tierId}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    onAdd(data.content)
  }

  const hint = CONTENT_TYPES.find(t => t.value === form.type)?.hint ?? ''

  return (
    <div className="rel-content-form">
      <div className="rel-form-row">
        <select className="rel-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input className="rel-input" placeholder="Title *" value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <input className="rel-input" placeholder={hint || 'URL (optional)'} value={form.url}
        onChange={e => setForm(f => ({ ...f, url: e.target.value }))} style={{ marginTop: 8 }} />
      <input className="rel-input" placeholder="Description (optional)" value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ marginTop: 8 }} />
      {error && <div className="lm-error" style={{ marginTop: 6 }}>{error}</div>}
      <div className="rel-form-actions">
        <button className="lm-btn-cancel" onClick={onCancel}>Cancel</button>
        <button className="lm-btn-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Adding...' : 'Add Content'}
        </button>
      </div>
    </div>
  )
}

// ── Tier Card ─────────────────────────────────────────────────────────────────
function TierCard({ tier, releaseId, onDelete, onUpdate }) {
  const [addingContent, setAddingContent]   = useState(false)
  const [contentList,   setContentList]     = useState(tier.tier_content ?? [])
  const [editingName,   setEditingName]     = useState(false)
  const [nameVal,       setNameVal]         = useState(tier.name)
  const [priceVal,      setPriceVal]        = useState(tier.price)

  const handleAddContent = (item) => {
    setContentList(c => [...c, item])
    setAddingContent(false)
  }

  const handleDeleteContent = async (contentId) => {
    if (!confirm('Remove this content item?')) return
    await fetch(`/api/admin/releases/${releaseId}/tiers/${tier.id}/content?contentId=${contentId}`, { method: 'DELETE' })
    setContentList(c => c.filter(x => x.id !== contentId))
  }

  const handleSaveName = async () => {
    await fetch(`/api/admin/releases/${releaseId}/tiers/${tier.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameVal, price: parseFloat(priceVal) }),
    })
    onUpdate(tier.id, { name: nameVal, price: parseFloat(priceVal) })
    setEditingName(false)
  }

  return (
    <div className="rel-tier-card">
      <div className="rel-tier-header">
        {editingName ? (
          <div className="rel-tier-edit-row">
            <input className="rel-input" value={nameVal} onChange={e => setNameVal(e.target.value)} placeholder="Tier name" style={{ flex: 1 }} />
            <div className="rel-price-wrap">
              <span className="rel-price-sym">$</span>
              <input className="rel-input rel-price-input" type="number" min="0" step="1" value={priceVal}
                onChange={e => setPriceVal(e.target.value)} placeholder="0" />
            </div>
            <button className="rel-btn-sm rel-btn-save" onClick={handleSaveName}>Save</button>
            <button className="rel-btn-sm" onClick={() => setEditingName(false)}>✕</button>
          </div>
        ) : (
          <div className="rel-tier-title-row">
            <div className="rel-tier-info">
              <span className="rel-tier-name">{tier.name}</span>
              <span className="rel-tier-price">${Number(tier.price).toFixed(0)}</span>
            </div>
            <div className="rel-tier-actions">
              <button className="rel-btn-sm" onClick={() => setEditingName(true)}>Edit</button>
              <button className="rel-btn-sm rel-btn-danger" onClick={() => onDelete(tier.id)}>✕</button>
            </div>
          </div>
        )}
      </div>

      {/* Content items */}
      <div className="rel-content-list">
        {contentList.length === 0 && !addingContent && (
          <div className="rel-content-empty">No content yet - add what this tier unlocks</div>
        )}
        {contentList.map(item => (
          <div key={item.id} className="rel-content-item">
            <span className="rel-content-type-icon" style={{ color: TYPE_COLORS[item.type] ?? '#888' }}>
              <ContentTypeIcon type={item.type} />
            </span>
            <div className="rel-content-item-info">
              <span className="rel-content-item-title">{item.title}</span>
              {item.description && <span className="rel-content-item-desc">{item.description}</span>}
            </div>
            <button className="rel-btn-sm rel-btn-danger" onClick={() => handleDeleteContent(item.id)}>✕</button>
          </div>
        ))}
        {addingContent && (
          <AddContentForm
            releaseId={releaseId}
            tierId={tier.id}
            onAdd={handleAddContent}
            onCancel={() => setAddingContent(false)}
          />
        )}
      </div>

      {!addingContent && (
        <button className="rel-add-content-btn" onClick={() => setAddingContent(true)}>+ Add Content</button>
      )}
    </div>
  )
}

// ── Release Editor ────────────────────────────────────────────────────────────
function ReleaseEditor({ release, onClose, onUpdate }) {
  const [tiers,       setTiers]       = useState(release.release_tiers?.sort((a, b) => a.position - b.position) ?? [])
  const [addingTier,  setAddingTier]  = useState(false)
  const [tierForm,    setTierForm]    = useState({ name: '', price: '', description: '' })
  const [savingTier,  setSavingTier]  = useState(false)
  const [tierErr,     setTierErr]     = useState(null)
  const [status,      setStatus]      = useState(release.status)
  const [saving,      setSaving]      = useState(false)

  const handleAddTier = async () => {
    if (!tierForm.name.trim()) { setTierErr('Tier name required'); return }
    setSavingTier(true); setTierErr(null)
    const res = await fetch(`/api/admin/releases/${release.id}/tiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tierForm, price: parseFloat(tierForm.price) || 0, position: tiers.length }),
    })
    const data = await res.json()
    setSavingTier(false)
    if (!res.ok) { setTierErr(data.error); return }
    setTiers(t => [...t, { ...data.tier, tier_content: [] }])
    setTierForm({ name: '', price: '', description: '' })
    setAddingTier(false)
  }

  const handleDeleteTier = async (tierId) => {
    if (!confirm('Delete this tier and all its content?')) return
    await fetch(`/api/admin/releases/${release.id}/tiers/${tierId}`, { method: 'DELETE' })
    setTiers(t => t.filter(x => x.id !== tierId))
  }

  const handleUpdateTier = (tierId, updates) => {
    setTiers(t => t.map(x => x.id === tierId ? { ...x, ...updates } : x))
  }

  const handleToggleStatus = async () => {
    // Cycle: draft → coming-soon → live → draft
    const cycle = { 'draft': 'coming-soon', 'coming-soon': 'live', 'live': 'draft' }
    const newStatus = cycle[status] ?? 'draft'
    setSaving(true)
    await fetch(`/api/admin/releases/${release.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setStatus(newStatus)
    onUpdate(release.id, { status: newStatus })
    setSaving(false)
  }

  return (
    <div className="rel-editor">
      {/* Editor header */}
      <div className="rel-editor-header">
        <div>
          <div className="rel-editor-title">{release.title}</div>
          <div className="rel-editor-sub">{release.type} · {tiers.length} tier{tiers.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="rel-editor-header-actions">
          <button
            className={`rel-status-btn ${status === 'live' ? 'rel-status-live' : status === 'coming-soon' ? 'rel-status-soon' : 'rel-status-draft'}`}
            onClick={handleToggleStatus} disabled={saving}
            title="Click to cycle: Draft → Coming Soon → Live"
          >
            {status === 'live' ? '● Live' : status === 'coming-soon' ? '◑ Coming Soon' : '○ Draft'}
          </button>
          <button className="rel-btn-sm" onClick={onClose}>← Back</button>
        </div>
      </div>

      {/* Tier guide */}
      <div className="rel-tier-guide">
        <span className="rel-tier-guide-label">💡 Each tier includes everything from the tier below.</span>
        <span className="rel-tier-guide-sub"> Sweet spot: 2–4 tiers. Two strong tiers beats four weak ones.</span>
      </div>

      {/* Tiers */}
      <div className="rel-tiers-list">
        {tiers.map((tier, i) => (
          <div key={tier.id}>
            <div className="rel-tier-position-label">Tier {i + 1}</div>
            <TierCard
              tier={tier}
              releaseId={release.id}
              onDelete={handleDeleteTier}
              onUpdate={handleUpdateTier}
            />
          </div>
        ))}
      </div>

      {/* Add tier */}
      {addingTier ? (
        <div className="rel-add-tier-form">
          <div className="adm-section-label">New Tier</div>
          <div className="rel-form-row">
            <input className="rel-input" placeholder="Tier name (e.g. Supporter)" value={tierForm.name}
              onChange={e => setTierForm(f => ({ ...f, name: e.target.value }))} style={{ flex: 1 }} />
            <div className="rel-price-wrap">
              <span className="rel-price-sym">$</span>
              <input className="rel-input rel-price-input" type="number" min="0" step="1" placeholder="0"
                value={tierForm.price} onChange={e => setTierForm(f => ({ ...f, price: e.target.value }))} />
            </div>
          </div>
          <input className="rel-input" placeholder="What does this tier include? (shown to fans)"
            value={tierForm.description} onChange={e => setTierForm(f => ({ ...f, description: e.target.value }))}
            style={{ marginTop: 8 }} />
          {tierErr && <div className="lm-error" style={{ marginTop: 6 }}>{tierErr}</div>}
          <div className="rel-form-actions">
            <button className="lm-btn-cancel" onClick={() => setAddingTier(false)}>Cancel</button>
            <button className="lm-btn-save" onClick={handleAddTier} disabled={savingTier}>
              {savingTier ? 'Adding...' : 'Add Tier'}
            </button>
          </div>
        </div>
      ) : (
        tiers.length < 4 && (
          <button className="rel-add-tier-btn" onClick={() => setAddingTier(true)}>+ Add Tier</button>
        )
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ReleasesManager() {
  const [releases,    setReleases]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [creating,    setCreating]    = useState(false)
  const [editingId,   setEditingId]   = useState(null)
  const [form,        setForm]        = useState({ title: '', description: '', artwork_url: '', type: 'album', release_date: '' })
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    fetch('/api/admin/releases')
      .then(r => r.json())
      .then(d => { setReleases(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const handleCreate = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError(null)
    const res = await fetch('/api/admin/releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    const newRelease = { ...data.release, release_tiers: [] }
    setReleases(r => [newRelease, ...r])
    setCreating(false)
    setForm({ title: '', description: '', artwork_url: '', type: 'album', release_date: '' })
    setEditingId(newRelease.id)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this release and all its tiers?')) return
    await fetch(`/api/admin/releases/${id}`, { method: 'DELETE' })
    setReleases(r => r.filter(x => x.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const handleUpdate = (id, updates) => {
    setReleases(r => r.map(x => x.id === id ? { ...x, ...updates } : x))
  }

  const editing = releases.find(r => r.id === editingId)

  if (loading) return <div className="adm2-empty">Loading...</div>

  // ── Editing a release ──
  if (editing) {
    return (
      <ReleaseEditor
        release={editing}
        onClose={() => setEditingId(null)}
        onUpdate={handleUpdate}
      />
    )
  }

  // ── Release list ──
  return (
    <div className="lm-wrap">
      <div className="lm-header">
        <div>
          <div className="lm-title">Releases</div>
          <div className="lm-sub">Create releases and attach tiered exclusive content</div>
        </div>
        {!creating && (
          <button className="lm-btn-new" onClick={() => setCreating(true)}>+ New Release</button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="lm-form-wrap">
          <div className="adm-section-label">New Release</div>
          <div className="rel-create-grid">
            <div className="lm-form-field">
              <label className="lm-label">Title *</label>
              <input className="lm-input" placeholder="e.g. Love Lost" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="lm-form-field">
              <label className="lm-label">Type</label>
              <select className="lm-input rel-select" value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="album">Album</option>
                <option value="single">Single</option>
                <option value="ep">EP</option>
              </select>
            </div>
            <div className="lm-form-field">
              <label className="lm-label">Release Date</label>
              <input className="lm-input" type="date" value={form.release_date}
                onChange={e => setForm(f => ({ ...f, release_date: e.target.value }))} />
            </div>
            <div className="lm-form-field">
              <label className="lm-label">Artwork URL</label>
              <input className="lm-input" placeholder="https://..." value={form.artwork_url}
                onChange={e => setForm(f => ({ ...f, artwork_url: e.target.value }))} />
            </div>
          </div>
          <div className="lm-form-field">
            <label className="lm-label">Description</label>
            <textarea className="lm-input" rows={3} placeholder="About this release..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>
          {error && <div className="lm-error">{error}</div>}
          <div className="lm-form-actions">
            <button className="lm-btn-cancel" onClick={() => setCreating(false)}>Cancel</button>
            <button className="lm-btn-save" onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Release →'}
            </button>
          </div>
        </div>
      )}

      {/* Release cards */}
      {releases.length === 0 && !creating ? (
        <div className="adm2-card adm2-empty" style={{ textAlign: 'center', padding: '40px 20px' }}>
          No releases yet. Create your first one.
        </div>
      ) : (
        <div className="rel-cards-grid">
          {releases.map(r => (
            <div key={r.id} className="rel-card" onClick={() => setEditingId(r.id)}>
              <div className="rel-card-art">
                {r.artwork_url
                  ? <img src={r.artwork_url} alt={r.title} className="rel-card-img" />
                  : <div className="rel-card-art-placeholder">◻</div>
                }
                <div className={`rel-card-status ${r.status === 'live' ? 'rel-status-live' : r.status === 'coming-soon' ? 'rel-status-soon' : 'rel-status-draft'}`}>
                  {r.status === 'live' ? '● Live' : r.status === 'coming-soon' ? '◑ Soon' : '○ Draft'}
                </div>
              </div>
              <div className="rel-card-info">
                <div className="rel-card-type">{r.type}</div>
                <div className="rel-card-title">{r.title}</div>
                <div className="rel-card-meta">
                  {r.release_tiers?.length ?? 0} tier{r.release_tiers?.length !== 1 ? 's' : ''}
                  {r.release_date && ` · ${new Date(r.release_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                </div>
              </div>
              <div className="rel-card-actions" onClick={e => e.stopPropagation()}>
                <button className="rel-btn-sm rel-btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
