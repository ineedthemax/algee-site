'use client'
import { useState, useEffect } from 'react'

const TIERS   = ['Day One', 'Rider', 'Legend']
const TYPES   = ['text', 'audio', 'video', 'link']
const TIER_COLORS = { 'Day One': '#c4222e', 'Rider': '#e8a020', 'Legend': '#9b59b6' }

export default function ExclusiveContentManager() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [error,    setError]    = useState(null)

  const blank = { title: '', description: '', type: 'text', content_url: '', content_body: '', min_tier: 'Day One' }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/exclusive-content').then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title required'); return }
    setSaving(true); setError(null)
    const method = editing ? 'PATCH' : 'POST'
    const body   = editing ? { id: editing, ...form } : form
    const res    = await fetch('/api/admin/exclusive-content', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data   = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    setItems(i => editing ? i.map(x => x.id === editing ? data : x) : [data, ...i])
    setCreating(false); setEditing(null); setForm(blank); setSaving(false)
  }

  const handleToggle = async (item) => {
    const updated = { ...item, active: !item.active }
    setItems(i => i.map(x => x.id === item.id ? updated : x))
    await fetch('/api/admin/exclusive-content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, active: !item.active }) })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this content?')) return
    setItems(i => i.filter(x => x.id !== id))
    await fetch('/api/admin/exclusive-content', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
  }

  const openEdit = (item) => { setForm({ title: item.title, description: item.description ?? '', type: item.type, content_url: item.content_url ?? '', content_body: item.content_body ?? '', min_tier: item.min_tier }); setEditing(item.id); setCreating(false) }

  if (loading) return <div className="adm-loading">Loading...</div>

  const showForm = creating || editing

  return (
    <div className="lm-wrap">
      <div className="lm-header">
        <div>
          <div className="lm-title">Exclusive Content</div>
          <div className="lm-sub">Tier-locked content for Day One, Rider & Legend fans</div>
        </div>
        {!showForm && <button className="lm-btn-new" onClick={() => { setCreating(true); setEditing(null); setForm(blank) }}>+ Add Content</button>}
      </div>

      {showForm && (
        <div className="lm-form-wrap">
          <div className="adm-section-label">{editing ? 'Edit Content' : 'New Exclusive Content'}</div>

          {/* Min tier */}
          <div className="lm-form-field" style={{ marginBottom: 10 }}>
            <label className="lm-label">Minimum Tier Required</label>
            <div className="sl-type-row">
              {TIERS.map(t => (
                <button key={t} className={`sl-type-btn${form.min_tier === t ? ' sl-type-active' : ''}`}
                  onClick={() => set('min_tier', t)} style={form.min_tier === t ? { borderColor: TIER_COLORS[t] } : {}}>
                  <div className="sl-type-name" style={{ color: TIER_COLORS[t] }}>{t}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="lm-form-field" style={{ marginBottom: 10 }}>
            <label className="lm-label">Content Type</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {TYPES.map(t => (
                <button key={t} className={`sl-theme-btn${form.type === t ? ' sl-theme-active' : ''}`}
                  onClick={() => set('type', t)} style={{ background: 'var(--card)', color: form.type === t ? 'var(--white)' : 'var(--muted)' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="lm-form-row">
            <div className="lm-form-field lm-form-field-grow">
              <label className="lm-label">Title</label>
              <input className="lm-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Unreleased Freestyle" />
            </div>
          </div>

          <div className="lm-form-field" style={{ marginBottom: 10 }}>
            <label className="lm-label">Description <span className="lm-optional">(optional)</span></label>
            <input className="lm-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short teaser fans see before unlocking" />
          </div>

          {(form.type === 'audio' || form.type === 'video' || form.type === 'link') && (
            <div className="lm-form-field" style={{ marginBottom: 10 }}>
              <label className="lm-label">URL</label>
              <input className="lm-input" value={form.content_url} onChange={e => set('content_url', e.target.value)} placeholder="https://..." type="url" />
            </div>
          )}

          {form.type === 'text' && (
            <div className="lm-form-field" style={{ marginBottom: 10 }}>
              <label className="lm-label">Content</label>
              <textarea className="lm-input" rows={5} value={form.content_body} onChange={e => set('content_body', e.target.value)} placeholder="Write your exclusive message, story, or note..." style={{ resize: 'vertical' }} />
            </div>
          )}

          {error && <div className="lm-error">{error}</div>}
          <div className="lm-form-actions">
            <button className="lm-btn-cancel" onClick={() => { setCreating(false); setEditing(null) }} disabled={saving}>Cancel</button>
            <button className="lm-btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save' : 'Publish'}</button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm
        ? <div className="adm-empty adm-card" style={{ textAlign: 'center', padding: '40px 20px' }}>No exclusive content yet.</div>
        : (
          <div className="lm-list">
            {items.map(item => (
              <div key={item.id} className={`lm-row${!item.active ? ' lm-row-inactive' : ''}`}>
                <div className="lm-row-left">
                  <div className="lm-cat-dot" style={{ background: TIER_COLORS[item.min_tier] ?? '#888' }} />
                  <div className="lm-row-info">
                    <div className="lm-row-title">
                      {item.title}
                      <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 7px', borderRadius: 4, background: TIER_COLORS[item.min_tier] + '22', color: TIER_COLORS[item.min_tier], fontWeight: 700, letterSpacing: 1 }}>
                        {item.min_tier}+
                      </span>
                    </div>
                    {item.description && <div className="lm-row-desc">{item.description}</div>}
                    <div className="lm-row-live">{item.type} · {new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="lm-row-actions">
                  <button className={`lm-toggle${item.active ? ' lm-toggle-on' : ''}`} onClick={() => handleToggle(item)}>{item.active ? 'Live' : 'Off'}</button>
                  <button className="lm-action-btn" onClick={() => openEdit(item)}>✎</button>
                  <button className="lm-action-btn lm-action-delete" onClick={() => handleDelete(item.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
