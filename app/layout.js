import { Playfair_Display, Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import Nav from './components/Nav'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import ScrollReveal from './components/ScrollReveal'
import ScrollProgress from './components/ScrollProgress'

// ─── Brand Fonts ───────────────────────────────────────────────
const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const barlow = Barlow({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  variable: '--font-label',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL('https://www.thealgeesmith.com'),
  title: 'Algee Smith | Two Stages, One Soul',
  description:
    'Actor. R&B artist. From Saginaw to Atlanta to LA. Direct from the artist to you. Step inside the music, the films, and everything in between.',
  openGraph: {
    title: 'Algee Smith | Two Stages, One Soul',
    description: 'Direct from the artist to you.',
    images: ['/images/hero/algee-hero.jpg'],
    url: 'https://www.thealgeesmith.com',
    siteName: 'Algee Smith',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Algee Smith | Two Stages, One Soul',
    description: 'Actor. R&B artist. Direct from the artist to you.',
    images: ['/images/hero/algee-hero.jpg'],
  },
  alternates: {
    canonical: 'https://www.thealgeesmith.com',
  },
}

// ─── Root Layout ───────────────────────────────────────────────
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${barlow.variable} ${barlowCondensed.variable}`}
    >
      <body>
        {/* Scroll progress bar */}
        <ScrollProgress />

        {/* Custom cursor + spotlight */}
        <CustomCursor />

        {/* Persistent nav */}
        <Nav />

        {/* Scroll reveal — fires on every page */}
        <ScrollReveal />

        {/* Page content */}
        <main>{children}</main>

        {/* Persistent footer */}
        <Footer />
      </body>
    </html>
  )
}
