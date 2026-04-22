// Pure tier data — safe to import in client components
export const TIERS = [
  {
    name:    'Free',
    min:     0,
    color:   '#888',
    icon:    '◻',
    tagline: 'Welcome to the family.',
    perks: [
      'Fan account & profile',
      'Access to all public content',
      'Music, film & fashion pages',
      'Points earning starts here',
    ],
  },
  {
    name:    'Day One',
    min:     200,
    color:   '#c4222e',
    icon:    '✦',
    tagline: 'You were here early.',
    perks: [
      'Everything in Free',
      'Early access notifications',
      'Exclusive content previews',
      'Day One badge on leaderboard',
    ],
  },
  {
    name:    'Rider',
    min:     600,
    color:   '#e8a020',
    icon:    '◈',
    tagline: 'Built different.',
    perks: [
      'Everything in Day One',
      'Behind-the-scenes content',
      'Priority merch drop access',
      'Rider badge on leaderboard',
    ],
  },
  {
    name:    'Legend',
    min:     1500,
    color:   '#9b59b6',
    icon:    '★',
    tagline: 'Your name is in the story.',
    perks: [
      'Everything in Rider',
      'Exclusive downloads & extras',
      'Direct community access',
      'Legend badge — permanent status',
    ],
  },
]

export function getTier(points) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].min) return TIERS[i]
  }
  return TIERS[0]
}

export function getNextTier(points) {
  const current = getTier(points)
  const idx = TIERS.findIndex(t => t.name === current.name)
  return TIERS[idx + 1] ?? null
}
