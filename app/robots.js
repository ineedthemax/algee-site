export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/account'],
      },
    ],
    sitemap: 'https://www.thealgeesmith.com/sitemap.xml',
    host: 'https://www.thealgeesmith.com',
  }
}
