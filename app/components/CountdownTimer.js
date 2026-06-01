'use client'

import { useState, useEffect } from 'react'

// July 7, 2026 — 12:00 AM EDT (UTC-4) = 04:00 UTC
const TARGET = new Date('2026-07-07T04:00:00Z')

function useCountdown() {
  const [time, setTime] = useState(null)

  useEffect(() => {
    const calc = () => {
      const diff = TARGET - Date.now()
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTime({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}

function pad(n) { return String(n).padStart(2, '0') }

/* ── Full homepage version ───────────────────────────────────── */
export function CountdownHero() {
  const time = useCountdown()

  return (
    <div className="cd-hero">
      <div className="cd-hero-inner">
        <div className="cd-hero-pulse-row">
          <span className="cd-hero-pulse" />
          <span className="cd-hero-pulse-label">something&apos;s coming</span>
        </div>

        {time ? (
          <div className="cd-hero-units">
            {[
              { val: time.days,    label: 'days'    },
              { val: time.hours,   label: 'hours'   },
              { val: time.minutes, label: 'min'     },
              { val: time.seconds, label: 'sec'     },
            ].map(({ val, label }, i) => (
              <div key={label} className="cd-hero-unit">
                {i > 0 && <span className="cd-hero-sep">:</span>}
                <div className="cd-hero-num">{pad(val)}</div>
                <div className="cd-hero-label">{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cd-hero-units cd-hero-units-loading">
            <div className="cd-hero-num">--</div>
            <span className="cd-hero-sep">:</span>
            <div className="cd-hero-num">--</div>
            <span className="cd-hero-sep">:</span>
            <div className="cd-hero-num">--</div>
            <span className="cd-hero-sep">:</span>
            <div className="cd-hero-num">--</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Mini dashboard card version ─────────────────────────────── */
export function CountdownCard() {
  const time = useCountdown()

  return (
    <div className="cd-card">
      <div className="cd-card-top">
        <div className="cd-card-pulse-row">
          <span className="cd-card-pulse" />
          <span className="cd-card-coming">something&apos;s coming</span>
        </div>
        <div className="cd-card-soon-badge">SOON</div>
      </div>

      {time ? (
        <div className="cd-card-units">
          {[
            { val: time.days,    label: 'days'  },
            { val: time.hours,   label: 'hrs'   },
            { val: time.minutes, label: 'min'   },
            { val: time.seconds, label: 'sec'   },
          ].map(({ val, label }, i) => (
            <div key={label} className="cd-card-unit">
              {i > 0 && <span className="cd-card-sep">:</span>}
              <div className="cd-card-num">{pad(val)}</div>
              <div className="cd-card-label">{label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cd-card-units">--:--:--:--</div>
      )}

      <div className="cd-card-glow" />
    </div>
  )
}
