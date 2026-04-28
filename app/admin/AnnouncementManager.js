'use client'
import { useState, useEffect } from 'react'

const TYPES = [
  { id: 'info',   label: '📢 General', color: '#3b82f6' },
  { id: 'music',  label: '🎵 Music',   color: '#c4222e' },
  { id: 'tour',   label: '🎤 Tour',    color: '#e8a020' },
  { id: 'merch',  label: '👕 Merch',   color: '#9b59b6' },
]

function typeColor(t) { return TYPES.find(x => x.id === t)?.color ?? '#888' }
function typeLabel(t) { return TYPES.find(x => x.id === t)?.label ?? t }

export default function AnnouncementManager() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [form,     setForm]     = useState({ title: '', body: '', type: 'info' })
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    fetch('/api/admin/announcements').then(r => r.json()).then(d => { setItems(d); setLoading(false) })
  }, [])

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim()) { setError('Title and body required'); return }
    setSaving(true); setError(null)
    const res  = await fetch('/api/admin/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    setItems(i => [data, ...i]); setCreating(false); setForm({ title: '', body: '', type: 'info' }); setSaving(false)
  }

  const handleToggle = async (item) => {
    const updated = { ...item, active: !item.active }
    setItems(i => i.map(x => x.id === item.id ? updated : x))
    await fetch('/api/admin/announcements', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, active: !item.active }) })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    setItems(i => i.filter(x => x.id !== id))
    await fetch('/api/admin/announcements', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
  }

  if (loading) return <div className="adm-loading">Loading...</div>

  return (
    <div className="lm-wrap">
      <div className="lm-header">
        <div>
          <div className="lm-title">Announcements</div>
          <div className="lm-sub">Push messages to all fan dashboards · {items.filter(i => i.active).length} active</div>
        </div>
        {!creating && <button className="lm-btn-new" onClick={() => setCreating(true)}>+ New</button>}
      </div>

      {creating && (
        <div className="lm-form-wrap">
          <div className="adm-section-label">New Announcement</div>
          <div className="sl-type-row" style={{ marginBottom: 12 }}>
            {TYPES.map(t => (
              <button key={t.id} className={`sl-type-btn${form.type === t.id ? ' sl-type-active' : ''}`}
                onClick={() => setForm(f => ({ ...f, type: t.id }))}>
                <div className="sl-type-name">{t.label}</div>
              </button>
            ))}
          </div>
          <div className="lm-form-field" style={{ marginBottom: 10 }}>
            <label className="lm-label">Title</label>
            <input className="lm-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. New single dropping Friday 🔴" />
          </div>
          <div className="lm-form-field" style={{ marginBottom: 10 }}>
            <label className="lm-label">Message</label>
            <textarea className="lm-input" rows={3} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Write your message to fans..." style={{ resize: 'vertical' }} />
          </div>
          {error && <div className="lm-error">{error}</div>}
          <div className="lm-form-actions">
            <button className="lm-btn-cancel" onClick={() => setCreating(false)}>Cancel</button>
            <button className="lm-btn-save" onClick={handleCreate} disabled={saving}>{saving ? 'Sending...' : 'Publish'}</button>
          </div>
        </div>
      )}

      {items.length === 0 && !creating
        ? <div className="adm-empty adm-card" style={{ textAlign: 'center', padding: '40px 20px' }}>No announcements yet.</div>
        : (
          <div className="lm-list">
            {items.map(item => (
              <div key={item.id} className={`lm-row${!item.active ? ' lm-row-inactive' : ''}`}>
                <div className="lm-row-left">
                  <div className="lm-cat-dot" style={{ background: typeColor(item.type) }} />
                  <div className="lm-row-info">
                    <div className="lm-row-title">{item.title}</div>
                    <div className="lm-row-desc">{item.body}</div>
                    <div className="lm-row-live">{typeLabel(item.type)} · {new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="lm-row-actions">
                  <button className={`lm-toggle${item.active ? ' lm-toggle-on' : ''}`} onClick={() => handleToggle(item)}>{item.active ? 'Live' : 'Off'}</button>
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
