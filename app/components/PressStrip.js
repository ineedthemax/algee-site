// Server component - no interactivity needed
const PRESS = [
  { name: 'HBO',                sub: 'Euphoria'          },
  { name: 'Lionsgate',           sub: 'The Gates'         },
  { name: 'BET',                sub: 'New Edition Story' },
  { name: '20th Century Fox',   sub: 'The Hate U Give'  },
  { name: 'Warner Bros.',       sub: 'Judas & The Black Messiah' },
  { name: 'Annapurna',          sub: 'Detroit'           },
  { name: 'Peacock',            sub: 'Shooting Stars'    },
  { name: 'Billboard',          sub: 'Featured'          },
  { name: 'Hollywood Reporter', sub: 'Featured'          },
  { name: 'Hulu',               sub: 'Solar Opposites'   },
]

const ALL = [...PRESS, ...PRESS]

export default function PressStrip() {
  return (
    <section className="press-section">
      <div className="press-label">As seen in</div>
      <div className="press-track-wrap">
        <div className="press-track">
          {ALL.map((p, i) => (
            <div key={i} className="press-item">
              <div className="press-name">{p.name}</div>
              <div className="press-sub">{p.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
