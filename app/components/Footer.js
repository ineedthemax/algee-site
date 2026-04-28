'use client'
import { usePathname } from 'next/navigation'

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/itsalgee' },
  { label: 'YouTube',   href: 'https://youtube.com/@algeesmith'  },
  { label: 'TikTok',    href: 'https://tiktok.com/@algeesmith'   },
  { label: 'Discord',   href: '#discord'                          },
]

export default function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return (
    <footer>
      {/* Massive tagline */}
      <div className="footer-massive" aria-label="Two Stages, One Soul">
        Two Stages
        <br />
        <span className="italic">one</span> soul.
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© 2026 Algee Smith · All Rights Reserved</span>
        <nav className="footer-socials" aria-label="Social links">
          {SOCIALS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {label}
            </a>
          ))}
          <a href="/faq">FAQ</a>
        </nav>
      </div>
    </footer>
  )
}
