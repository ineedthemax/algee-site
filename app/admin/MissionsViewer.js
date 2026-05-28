'use client'
import { useState, useEffect } from 'react'
import { MISSIONS } from '../../lib/missions'

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Human-readable labels for fan-profile fields
const FIELD_LABELS = {
  city:           'City repping',
  fav_food:       'Favorite food',
  fav_restaurant: 'Favorite restaurant',
  fav_icecream:   'Favorite ice cream',
  fav_song:       'Favorite Algee song',
  fav_project:    'Favorite film/show',
  discovered:     'How they found Algee',
}

export default function MissionsViewer() {
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(null) // mission_id currently browsing
  const [expanded,   setExpanded]   = useState(null) // fan entry expanded

  useEffect(() => {
    fetch('/api/admin/missions')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="adm-loading">Loading mission data…</div>
  if (!data)   return <div className="adm-error">Failed to load mission data.</div>

  const { byMission, counts, total } = data

  // Match a mission_id to its definition
  const getMissionDef = (id) => MISSIONS.find(m => m.id === id)

  const selectedEntries = selected ? (byMission[selected] ?? []) : []
  const selectedDef     = selected ? getMissionDef(selected) : null

  return (
    <div className="mv-shell">

      {/* Summary bar */}
      <div className="mv-summary">
        <div className="mv-summary-stat">
          <span className="mv-summary-val">{total}</span>
          <span className="mv-summary-label">Total Completions</span>
        </div>
        <div className="mv-summary-stat">
          <span className="mv-summary-val">{counts.length}</span>
          <span className="mv-summary-label">Missions Attempted</span>
        </div>
        <div className="mv-summary-stat">
          <span className="mv-summary-val">
            {counts.find(c => c.mission_id === 'fan-profile')?.count ?? 0}
          </span>
          <span className="mv-summary-label">Profile Surveys</span>
        </div>
      </div>

      <div className="mv-layout">

        {/* Left — mission list */}
        <div className="mv-sidebar">
          <div className="mv-sidebar-label">All Missions</div>
          {counts.map(({ mission_id, count }) => {
            const def = getMissionDef(mission_id)
            return (
              <button
                key={mission_id}
                className={`mv-mission-btn${selected === mission_id ? ' mv-mission-active' : ''}`}
                onClick={() => { setSelected(mission_id); setExpanded(null) }}
              >
                <span className="mv-mission-icon">{def?.icon ?? '◻'}</span>
                <span className="mv-mission-name">{def?.title ?? mission_id}</span>
                <span className="mv-mission-count">{count}</span>
              </button>
            )
          })}

          {/* Missions not yet attempted */}
          {MISSIONS.filter(m => !counts.find(c => c.mission_id === m.id)).map(m => (
            <button
              key={m.id}
              className="mv-mission-btn mv-mission-zero"
              onClick={() => { setSelected(m.id); setExpanded(null) }}
            >
              <span className="mv-mission-icon">{m.icon}</span>
              <span className="mv-mission-name">{m.title}</span>
              <span className="mv-mission-count mv-zero">0</span>
            </button>
          ))}
        </div>

        {/* Right — entries */}
        <div className="mv-entries">
          {!selected ? (
            <div className="mv-placeholder">← Select a mission to see fan responses</div>
          ) : selectedEntries.length === 0 ? (
            <div className="adm2-empty">No completions yet for {selectedDef?.title ?? selected}.</div>
          ) : (
            <>
              <div className="mv-entries-header">
                <span className="mv-entries-title">
                  {selectedDef?.icon} {selectedDef?.title ?? selected}
                </span>
                <span className="mv-entries-pts">{selectedDef?.points ?? '?'} pts · {selectedEntries.length} fan{selectedEntries.length !== 1 ? 's' : ''}</span>
              </div>

              {selectedEntries.map((entry, i) => {
                const hasAnswers = entry.metadata && Object.keys(entry.metadata).length > 0
                const isOpen     = expanded === i

                return (
                  <div key={i} className={`mv-entry${isOpen ? ' mv-entry-open' : ''}`}>
                    <div
                      className="mv-entry-head"
                      onClick={() => hasAnswers && setExpanded(isOpen ? null : i)}
                      style={{ cursor: hasAnswers ? 'pointer' : 'default' }}
                    >
                      <span className="mv-entry-email">{entry.email}</span>
                      <div className="mv-entry-meta">
                        <span className="mv-entry-time">{timeAgo(entry.completed_at)}</span>
                        {hasAnswers && (
                          <span className="mv-entry-toggle">{isOpen ? '▲' : '▼'} answers</span>
                        )}
                      </div>
                    </div>

                    {isOpen && hasAnswers && (
                      <div className="mv-entry-answers">
                        {Object.entries(entry.metadata).map(([key, val]) => (
                          <div key={key} className="mv-answer-row">
                            <span className="mv-answer-label">
                              {FIELD_LABELS[key] ?? key}
                            </span>
                            <span className="mv-answer-val">{val || '—'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
