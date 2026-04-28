const BASE_URL = 'https://www.thealgeesmith.com'

export default function sitemap() {
  const now = new Date().toISOString()

  const staticPages = [
    { url: BASE_URL,              changeFrequency: 'weekly',  priority: 1.0,  lastModified: now },
    { url: `${BASE_URL}/about`,   changeFrequency: 'monthly', priority: 0.9,  lastModified: now },
    { url: `${BASE_URL}/music`,   changeFrequency: 'weekly',  priority: 0.9,  lastModified: now },
    { url: `${BASE_URL}/film`,    changeFrequency: 'monthly', priority: 0.9,  lastModified: now },
    { url: `${BASE_URL}/releases`,changeFrequency: 'weekly',  priority: 0.85, lastModified: now },
    { url: `${BASE_URL}/merch`,   changeFrequency: 'weekly',  priority: 0.8,  lastModified: now },
    { url: `${BASE_URL}/faq`,     changeFrequency: 'monthly', priority: 0.75, lastModified: now },
    { url: `${BASE_URL}/join`,    changeFrequency: 'monthly', priority: 0.7,  lastModified: now },
    { url: `${BASE_URL}/leaderboard`, changeFrequency: 'daily', priority: 0.65, lastModified: now },
    { url: `${BASE_URL}/fan-wall`,changeFrequency: 'daily',   priority: 0.6,  lastModified: now },
    { url: `${BASE_URL}/playlists`,changeFrequency: 'monthly',priority: 0.6,  lastModified: now },
  ]

  return staticPages
}
