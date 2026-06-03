/** @type {import('next').NextConfig} */
const nextConfig = {

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security',  value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control',     value: 'on' },
        ],
      },
    ]
  },

  images: {
    // Serve WebP/AVIF automatically for Next.js <Image> components
    formats: ['image/avif', 'image/webp'],

    // Breakpoints for srcset generation
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],

    // Minimize re-optimization on repeated requests
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days

    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      // Supabase storage — for release artwork, fan avatars, etc.
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      // Randomuser (account page proof avatars)
      { protocol: 'https', hostname: 'randomuser.me' },
    ],
  },

  // Compress JS output
  compress: true,

  // Strict mode for catching issues early
  reactStrictMode: true,
}

export default nextConfig
