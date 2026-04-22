'use client'

import Link from 'next/link'

export default function MissionsHub({ missions, completedMap }) {
  const totalPoints   = missions.reduce((s, m) => s + m.points, 0)
  const earnedPoints  = missions
    .filter(m => completedMap[m.id])
    .reduce((s, m) => s + m.points, 0)
  const completedCount = Object.keys(completedMap).length

  return (
    <div className="missions-page">
      <div className="missions-inner">

        {/* Hero */}
        <div className="page-hero">
          <div className="page-hero-label">Fan Missions</div>
          <h1>Complete. <span className="italic">Earn. Level up.</span></h1>
          <p className="page-hero-sub">
            Missions unlock more of the world. Every one you finish earns points.
          </p>
        </div>

        {/* Progress strip */}
        <div className="missions-progress-strip">
          <div className="missions-progress-stat">
            <span className="missions-progress-val">{completedCount}</span>
            <span className="missions-progress-label">of {missions.length} complete</span>
          </div>
          <div className="missions-progress-bar-wrap">
            <div className="missions-progress-bar-track">
              <div
                className="missions-progress-bar-fill"
                style={{ width: `${missions.length ? (completedCount / missions.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="missions-progress-stat" style={{ textAlign: 'right' }}>
            <span className="missions-progress-val">{earnedPoints}</span>
            <span className="missions-progress-label">of {totalPoints} pts earned</span>
          </div>
        </div>

        {/* Mission cards */}
        <div className="missions-list">
          {missions.map(mission => {
            const done = !!completedMap[mission.id]
            return (
              <div key={mission.id} className={`mission-card${done ? ' mission-done' : ''}`}>
                <div className="mission-card-left">
                  <div className="mission-icon" style={{ color: done ? '#555' : mission.color }}>
                    {done ? '✓' : mission.icon}
                  </div>
                  <div className="mission-info">
                    <div className="mission-category">{mission.category}</div>
                    <div className="mission-title">{mission.title}</div>
                    <div className="mission-desc">{mission.description}</div>
                    {done && (
                      <div className="mission-done-label">
                        Completed · +{mission.points} pts earned
                      </div>
                    )}
                  </div>
                </div>
                <div className="mission-card-right">
                  {done ? (
                    <div className="mission-pts-done">+{mission.points}</div>
                  ) : (
                    <>
                      <div className="mission-pts">+{mission.points} pts</div>
                      <Link
                        href={`/missions/${mission.id}`}
                        className="mission-cta"
                        style={{ borderColor: mission.color, color: mission.color }}
                      >
                        Start →
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
