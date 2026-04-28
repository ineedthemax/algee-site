'use client'
import { useState, useEffect } from 'react'

function fmt(amount) {
  return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(dateStr).toLocaleDateString()
}

function truncateEmail(email, max = 24) {
  if (!email || email.length <= max) return email
  const [local, domain] = email.split('@')
  if (!domain) return email.slice(0, max) + '…'
  const short = local.length > 10 ? local.slice(0, 8) + '…' : local
  return `${short}@${domain}`
}

const EMPTY_FORM = { email: '', item_name: '', amount: '', notes: '' }

export default function SpendingManager() {
  const [purchases, setPurchases] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    fetch('/api/admin/purchases')
      .then(r => r.json())
      .then(d => { setPurchases(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const totalRevenue = purchases.reduce((sum, p) => sum + parseFloat(p.amount ?? 0), 0)

  const handleLog = async () => {
    if (!form.email.trim() || !form.item_name.trim() || form.amount === '') {
      setError('Email, item name, and amount are required.')
      return
    }
    setSaving(true)
    setError(null)
    const res  = await fetch('/api/admin/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:     form.email.trim(),
        item_name: form.item_name.trim(),
        amount:    parseFloat(form.amount),
        notes:     form.notes.trim() || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return }
    setPurchases(prev => [data, ...prev])
    setForm(EMPTY_FORM)
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this purchase record?')) return
    setPurchases(prev => prev.filter(p => p.id !== id))
    await fetch('/api/admin/purchases', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  if (loading) return <div className="adm-loading">Loading purchases…</div>

  return (
    <div className="lm-wrap">
      <div className="lm-header">
        <div>
          <div className="lm-title">Fan Spending</div>
          <div className="lm-sub">Track purchases and revenue from fans</div>
        </div>
      </div>

      {/* Stats */}
      <div className="adm2-stats-grid">
        <div className="adm2-stat">
          <div className="adm2-stat-value" style={{ color: '#22c55e' }}>${fmt(totalRevenue)}</div>
          <div className="adm2-stat-label">Total Revenue</div>
        </div>
        <div className="adm2-stat">
          <div className="adm2-stat-value">{purchases.length}</div>
          <div className="adm2-stat-label">Total Purchases</div>
        </div>
      </div>

      {/* Log Purchase Form */}
      <div className="lm-form-wrap">
        <div className="adm2-section-label">Log a Purchase</div>

        <div className="lm-form-field">
          <label className="lm-label">Fan Email</label>
          <input
            className="lm-input"
            type="email"
            placeholder="fan@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>

        <div className="lm-form-field">
          <label className="lm-label">Item Name</label>
          <input
            className="lm-input"
            type="text"
            placeholder="e.g. Merch Bundle, VIP Ticket"
            value={form.item_name}
            onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))}
          />
        </div>

        <div className="lm-form-field">
          <label className="lm-label">Amount ($)</label>
          <input
            className="lm-input"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          />
        </div>

        <div className="lm-form-field">
          <label className="lm-label">Notes (optional)</label>
          <input
            className="lm-input"
            type="text"
            placeholder="e.g. VIP upgrade, bundle discount"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </div>

        {error && <div className="lm-error">{error}</div>}

        <div className="lm-form-actions">
          <button className="lm-btn-cancel" onClick={() => { setForm(EMPTY_FORM); setError(null) }}>Clear</button>
          <button className="lm-btn-save" onClick={handleLog} disabled={saving}>
            {saving ? 'Saving…' : 'Log Purchase'}
          </button>
        </div>
      </div>

      {/* Purchase List */}
      {purchases.length === 0 ? (
        <div className="adm2-empty adm2-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          No purchases logged yet.
        </div>
      ) : (
        <div className="adm2-card">
          {purchases.map(p => (
            <div key={p.id} className="adm2-row">
              <span className="adm2-row-main">
                {truncateEmail(p.profiles?.email ?? p.email)}
              </span>
              <span className="adm2-row-main" style={{ flex: 2 }}>
                {p.item_name}
              </span>
              {p.notes && (
                <span className="adm2-row-main" style={{ color: '#888', fontSize: '0.85em', flex: 2 }}>
                  {p.notes}
                </span>
              )}
              <span className="adm2-row-pts" style={{ color: '#22c55e' }}>
                ${fmt(p.amount)}
              </span>
              <span className="adm2-row-time">{timeAgo(p.created_at)}</span>
              <button
                className="lm-action-btn lm-action-delete"
                onClick={() => handleDelete(p.id)}
                title="Delete purchase"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
