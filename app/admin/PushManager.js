'use client'
import { useState, useEffect } from 'react'

export default function PushManager() {
  const [subCount, setSubCount] = useState(null)
  const [sends,    setSends]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [composing,setComposing]= useState(false)
  const [sending,  setSending]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState(null)
  const [form,     setForm]     = useState({ title: '', body: '', url: '/', image: '' })

  useEffect(() => {
    fetch('/api/admin/push-stats')
      .then(r => r.json())
      .then(d => {
        setSubCount(d.subscribers ?? 0)
        setSends(Array.isArray(d.sends) ? d.sends : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) { setError('Title and body required'); return }
    if (!confirm(`Send push notification to all ${subCount} subscribers?`)) return
    setSending(true); setError(null); setResult(null)
    const res  = await fetch('/api/admin/push-send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...form, image: form.image || undefined }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) { setError(data.error); return }
    setResult(data)
    setSends(s => [{
      id:         Date.now(),
      title:      form.title,
      body:       form.body,
      sent:       data.sent,
      total:      data.total,
      created_at: new Date().toISOString(),
    }, ...s])
    setComposing(false)
    setForm({ title: '', body: '', url: '/', image: '' })
    setSubCount(data.total - data.cleaned)
  }

  if (loading) return <div className="adm-loading">Loading...</div>

  return (
    <div className="lm-wrap">
      <div className="lm-header">
        <div>
          <div className="lm-title">Push Notifications</div>
          <div className="lm-sub">
            {subCount === null ? 'Loading...' : `${subCount} subscribers · ${sends.length} sent`}
          </div>
        </div>
        {!composing && (
          <button className="lm-btn-new" onClick={() => { setComposing(true); setResult(null) }}>
            + Send Push
          </button>
        )}
      </div>

      {result && (
        <div className="pt-result pt-result-ok">
          ✓ Sent to {result.sent} / {result.total} subscribers
          {result.cleaned > 0 && ` · ${result.cleaned} stale removed`}
        </div>
      )}

      {composing && (
        <div className="lm-form-wrap">
          <div className="adm-section-label">New Push Notification</div>

          <div className="lm-form-field" style={{ marginBottom: 10 }}>
            <label className="lm-label">Title</label>
            <input
              className="lm-input"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Love Lost is out NOW 🔴"
              maxLength={80}
            />
          </div>

          <div className="lm-form-field" style={{ marginBottom: 10 }}>
            <label className="lm-label">Message</label>
            <textarea
              className="lm-input"
              rows={3}
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Short message fans see in the notification..."
              maxLength={200}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="lm-form-row" style={{ gap: 10 }}>
            <div className="lm-form-field lm-form-field-grow">
              <label className="lm-label">Link URL <span className="lm-optional">(where it opens)</span></label>
              <input
                className="lm-input"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="/"
              />
            </div>
            <div className="lm-form-field lm-form-field-grow">
              <label className="lm-label">Image URL <span className="lm-optional">(optional)</span></label>
              <input
                className="lm-input"
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="sl-hint" style={{ marginBottom: 12 }}>
            🔔 Sent instantly to every fan who enabled notifications. Keep it short and direct.
          </div>

          {error && <div className="lm-error">{error}</div>}
          <div className="lm-form-actions">
            <button className="lm-btn-cancel" onClick={() => setComposing(false)} disabled={sending}>Cancel</button>
            <button className="lm-btn-save" onClick={handleSend} disabled={sending}>
              {sending ? 'Sending...' : `Send to ${subCount ?? '?'} Fans`}
            </button>
          </div>
        </div>
      )}

      {sends.length === 0 && !composing ? (
        <div className="adm-empty adm-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          No push notifications sent yet.
        </div>
      ) : sends.length > 0 && (
        <div className="lm-list">
          {sends.map(s => (
            <div key={s.id} className="lm-row">
              <div className="lm-row-left">
                <div className="lm-cat-dot" style={{ background: '#c4222e' }} />
                <div className="lm-row-info">
                  <div className="lm-row-title">{s.title}</div>
                  <div className="lm-row-desc">{s.body}</div>
                  <div className="lm-row-live">
                    Sent to {s.sent?.toLocaleString() ?? '—'} fans · {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
