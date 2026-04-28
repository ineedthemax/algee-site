'use client'
import { useState, useEffect } from 'react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function FanOfMonthManager() {
  const [records,  setRecords]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [form,     setForm]     = useState({ email: '', display_name: '', reason: '', bonus_points: 100 })
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(false)

  useEffect(() => {
    fetch('/api/admin/fan-of-month')
      .then(r => r.json())
      .then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const current = records[0] ?? null
  const now     = new Date()
  const isThisMonth = current && current.month === now.getMonth() + 1 && current.year === now.getFullYear()

  const handleSave = async () => {
    if (!form.email.trim()) { setError('Email is required'); return }
    setSaving(true); setError(null); setSuccess(false)
    const res  = await fetch('/api/admin/fan-of-month', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    setRecords(r => [data.record, ...r.filter(x => !(x.month === data.record.month && x.year === data.record.year))])
    setSuccess(true)
    setForm({ email: '', display_name: '', reason: '', bonus_points: 100 })
  }

  if (loading) return <div className="adm2-empty">Loading...</div>

  return (
    <div className="lm-wrap">

      {/* Header */}
      <div className="lm-header">
        <div>
          <div className="lm-title">Fan of the Month</div>
          <div className="lm-sub">Pick one fan each month · they earn bonus points + public recognition</div>
        </div>
      </div>

      {/* Current FOTM */}
      {isThisMonth && current && (
        <div className="fotm-current-card">
          <div className="fotm-crown">👑</div>
          <div className="fotm-current-label">
            {MONTHS[current.month - 1]} {current.year} Fan of the Month
          </div>
          <div className="fotm-current-name">{current.display_name || current.email}</div>
          {current.reason && <div className="fotm-current-reason">"{current.reason}"</div>}
          <div className="fotm-current-pts">+{current.bonus_points} pts awarded</div>
        </div>
      )}

      {/* Pick form */}
      <div className="lm-form-wrap">
        <div className="adm-section-label">
          {isThisMonth ? 'Update This Month\'s Pick' : 'Pick Fan of the Month'}
        </div>

        <div className="lm-form-field">
          <label className="lm-label">Fan Email *</label>
          <input className="lm-input" type="email" placeholder="fan@email.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="lm-form-field">
          <label className="lm-label">Display Name <span className="lm-optional">(shown publicly)</span></label>
          <input className="lm-input" placeholder="e.g. Marcus from Atlanta"
            value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
        </div>
        <div className="lm-form-field">
          <label className="lm-label">Reason <span className="lm-optional">(shown publicly)</span></label>
          <input className="lm-input" placeholder="e.g. Always in the comments, always showing love."
            value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
        </div>
        <div className="lm-form-field">
          <label className="lm-label">Bonus Points</label>
          <input className="lm-input" type="number" min={0} step={25}
            value={form.bonus_points} onChange={e => setForm(f => ({ ...f, bonus_points: Number(e.target.value) }))} />
        </div>

        {error   && <div className="lm-error">{error}</div>}
        {success && <div className="pt-result pt-result-ok">✓ Fan of the Month saved!</div>}

        <div className="lm-form-actions">
          <button className="lm-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '👑 Set Fan of the Month'}
          </button>
        </div>
      </div>

      {/* History */}
      {records.length > 0 && (
        <>
          <div className="adm-section-label" style={{ marginTop: 32 }}>History</div>
          <div className="lm-list">
            {records.map(r => (
              <div key={r.id} className="lm-row">
                <div className="lm-row-left">
                  <div className="lm-cat-dot" style={{ background: '#e8a020' }} />
                  <div className="lm-row-info">
                    <div className="lm-row-title">{r.display_name || r.email}</div>
                    <div className="lm-row-desc">{r.reason || <em style={{ opacity: 0.5 }}>No reason given</em>}</div>
                    <div className="lm-row-live">
                      {MONTHS[r.month - 1]} {r.year} · +{r.bonus_points} pts
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
