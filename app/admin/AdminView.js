'use client'

import { useState } from 'react'

export default function AdminView({ fans, stats }) {
  const [search, setSearch] = useState('')

  const filtered = fans.filter(f =>
    f.email?.toLowerCase().includes(search.toLowerCase()) ||
    f.phone?.includes(search)
  )

  return (
    <div className="admin-page">
      <div className="admin-inner">

        {/* Header */}
        <div className="admin-header">
          <div>
            <div className="admin-eyebrow">Admin</div>
            <h1 className="admin-headline">Fan Dashboard</h1>
          </div>
          <div className="admin-nav-links">
            <a href="/analytics" className="admin-nav-link">Analytics</a>
            <a href="/" className="admin-back">← Back to site</a>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat">
            <div className="admin-stat-value">{stats.total}</div>
            <div className="admin-stat-label">Total Fans</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-value">{stats.thisWeek}</div>
            <div className="admin-stat-label">This Week</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-value">{stats.withPhone}</div>
            <div className="admin-stat-label">SMS Opted In</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-value">
              {stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0}%
            </div>
            <div className="admin-stat-label">SMS Rate</div>
          </div>
        </div>

        {/* Search */}
        <div className="admin-search-wrap">
          <input
            className="admin-search"
            type="text"
            placeholder="Search by email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="admin-count">
            {filtered.length} of {fans.length} fans
          </span>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Phone</th>
                <th>SMS</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    {fans.length === 0 ? 'No fans yet.' : 'No results for that search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((fan, i) => (
                  <tr key={fan.id}>
                    <td className="admin-td-num">{fans.indexOf(fan) + 1}</td>
                    <td className="admin-td-email">{fan.email}</td>
                    <td className="admin-td-phone">{fan.phone || <span className="admin-none">—</span>}</td>
                    <td>
                      {fan.phone
                        ? <span className="admin-badge sms-yes">Yes</span>
                        : <span className="admin-badge sms-no">No</span>
                      }
                    </td>
                    <td className="admin-td-date">
                      {new Date(fan.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Export hint */}
        <div className="admin-footer-note">
          To export — go to Supabase → Table Editor → profiles → Export CSV
        </div>

      </div>
    </div>
  )
}
