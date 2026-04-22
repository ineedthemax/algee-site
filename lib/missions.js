// ─── Mission definitions ───────────────────────────────────────────────────
// All mission data lives here. Add new missions to this array.

export const MISSIONS = [
  {
    id:          'fan-profile',
    title:       'Tell Us About You',
    description: 'Fill out your fan profile and let Algee know who you are.',
    points:      50,
    icon:        '◎',
    color:       '#c4222e',
    category:    'Profile',
    questions: [
      { id: 'city',        label: 'What city are you repping?',             type: 'text',   placeholder: 'e.g. Atlanta, GA'         },
      { id: 'fav_food',    label: 'Favorite food?',                         type: 'text',   placeholder: 'e.g. Jerk chicken'        },
      { id: 'fav_restaurant', label: 'Favorite restaurant?',               type: 'text',   placeholder: 'e.g. Dave\'s Hot Chicken' },
      { id: 'fav_icecream', label: 'Favorite ice cream flavor?',            type: 'text',   placeholder: 'e.g. Cookies & cream'     },
      { id: 'fav_song',    label: 'Favorite Algee song?',                   type: 'text',   placeholder: 'e.g. Love Lost'           },
      { id: 'fav_project', label: 'Favorite Algee film or show?',           type: 'text',   placeholder: 'e.g. The Hate U Give'     },
      { id: 'discovered',  label: 'How did you first discover Algee?',      type: 'textarea', placeholder: 'Tell the story...'       },
    ],
  },
]

// ─── Get a mission by id ──────────────────────────────────────────────────
export function getMission(id) {
  return MISSIONS.find(m => m.id === id) ?? null
}
