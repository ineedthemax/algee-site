'use client'

import { useState, useEffect } from 'react'

const ACTIVITIES = [
  // Listening
  { type: 'music', name: 'Marcus',    city: 'Atlanta',       action: 'listening to',  title: 'Numb'              },
  { type: 'music', name: 'Jasmine',   city: 'Houston',       action: 'listening to',  title: 'Spiraling'         },
  { type: 'music', name: 'Sofia',     city: 'Miami',         action: 'listening to',  title: 'Magic City'        },
  { type: 'music', name: 'DeAndre',   city: 'Los Angeles',   action: 'listening to',  title: 'Honest'            },
  { type: 'music', name: 'Naomi',     city: 'Chicago',       action: 'listening to',  title: 'Departed'          },
  { type: 'music', name: 'Carlos',    city: 'Dallas',        action: 'listening to',  title: 'Sinners'           },
  { type: 'music', name: 'Amara',     city: 'London',        action: 'listening to',  title: 'The Way It Goes'   },
  { type: 'music', name: 'Yuna',      city: 'Seoul',         action: 'listening to',  title: 'Numb'              },
  { type: 'music', name: 'Tiana',     city: 'Memphis',       action: 'listening to',  title: 'Magic City'        },
  { type: 'music', name: 'Miguel',    city: 'Phoenix',       action: 'listening to',  title: 'Spiraling'         },
  { type: 'music', name: 'Priya',     city: 'Houston',       action: 'listening to',  title: 'Honest'            },
  { type: 'music', name: 'Kwame',     city: 'Lagos',         action: 'listening to',  title: 'Departed'          },
  { type: 'music', name: 'Emma',      city: 'Nashville',     action: 'listening to',  title: 'Sinners'           },
  { type: 'music', name: 'Jordan',    city: 'Philadelphia',  action: 'listening to',  title: 'The Way It Goes'   },

  // Watching film
  { type: 'film',  name: 'Aaliyah',   city: 'New York',      action: 'watching',      title: 'Euphoria'          },
  { type: 'film',  name: 'Omar',      city: 'Toronto',       action: 'watching',      title: 'The Hate U Give'   },
  { type: 'film',  name: 'Fatima',    city: 'Paris',         action: 'watching',      title: 'Detroit'           },
  { type: 'film',  name: 'Isaiah',    city: 'St. Louis',     action: 'watching',      title: 'The Gates'         },
  { type: 'film',  name: 'Camila',    city: 'Los Angeles',   action: 'watching',      title: 'The New Edition Story' },
  { type: 'film',  name: 'Kevin',     city: 'Seattle',       action: 'watching',      title: 'Euphoria'          },
  { type: 'film',  name: 'Zara',      city: 'Dubai',         action: 'watching',      title: 'The Hate U Give'   },
  { type: 'film',  name: 'Andre',     city: 'São Paulo',     action: 'watching',      title: 'Detroit'           },
  { type: 'film',  name: 'Malik',     city: 'Baltimore',     action: 'watching',      title: 'The Gates'         },
  { type: 'film',  name: 'Luca',      city: 'Milan',         action: 'watching',      title: 'The New Edition Story' },
]

const POSITIONS = [
  { top: '8%',  left: '2%'  },
  { top: '8%',  right: '2%' },
  { top: '32%', left: '0%'  },
  { top: '32%', right: '0%' },
  { top: '58%', left: '2%'  },
  { top: '58%', right: '2%' },
  { top: '80%', left: '8%'  },
  { top: '80%', right: '8%' },
]

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function SphereActivity() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const pool     = shuffle(ACTIVITIES)
    const posList  = shuffle(POSITIONS)
    let poolIdx    = 0
    let posIdx     = 0
    let toastId    = 0

    const spawnToast = () => {
      const activity = pool[poolIdx % pool.length]
      const pos      = posList[posIdx % posList.length]
      poolIdx++
      posIdx++
      toastId++

      const id = toastId

      setToasts((prev) => [...prev.slice(-5), { id, activity, pos, visible: false }])

      // Fade in
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: true } : t))
        )
      }, 50)

      // Fade out + remove
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
        )
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 600)
      }, 4000)
    }

    // Stagger initial spawns across positions
    POSITIONS.forEach((_, i) => {
      setTimeout(spawnToast, i * 900)
    })

    // Keep spawning
    const interval = setInterval(spawnToast, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="sphere-activity-wrap" aria-hidden="true">
      {toasts.map(({ id, activity, pos, visible }) => (
        <div
          key={id}
          className={`sphere-toast ${activity.type === 'music' ? 'music-toast' : 'film-toast'} ${visible ? 'visible' : ''}`}
          style={pos}
        >
          {/* Icon bubble */}
          <span className="sphere-toast-icon">
            {activity.type === 'music' ? '🎵' : '🎬'}
          </span>

          {/* Text */}
          <div className="sphere-toast-text">
            <div className="sphere-toast-top">
              <span className="sphere-toast-name">{activity.name}</span>
              <span className="sphere-toast-city">· {activity.city}</span>
            </div>
            <div className="sphere-toast-bottom">
              <span className="sphere-toast-dot" />
              <span className="sphere-toast-action">
                {activity.action}
              </span>
              <span className="sphere-toast-title">{activity.title}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
