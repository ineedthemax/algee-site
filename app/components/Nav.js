'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

const NAV_LINKS = [
  { label: 'Music',    href: '/music'    },
  { label: 'Film',     href: '/film'     },
  { label: 'Fashion',  href: '/fashion'  },
  { label: 'Videos',   href: '/videos'   },
  { label: 'Releases', href: '/releases' },
  { label: 'Merch',    href: '/merch'    },
  { label: 'About',    href: '/about'    },
]

export default function Nav() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [user,      setUser]      = useState(null)
  const pathname = usePathname()
  const router   = useRouter()

  // Hide entirely on admin pages — admin has its own layout
  if (pathname?.startsWith('/admin')) return null

  // Scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auth state
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        {/* Logo */}
        <Link href="/" className="nav-logo">
          <span className="nav-logo-dot" aria-hidden="true" />
          Algee Smith
        </Link>

        {/* Center links — desktop only */}
        <ul className="nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>

        {/* CTA — desktop only */}
        <div className="nav-actions nav-actions-desktop">
          {user ? (
            <>
              <Link href="/account/dashboard" className="nav-login">My Account</Link>
              <button className="nav-join nav-join-btn" onClick={handleSignOut}>
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/account" className="nav-login">Log In</Link>
              <div className="nav-join-wrap">
                <Link href="/account" className="nav-join">
                  <span>Get Access →</span>
                </Link>
                <span className="nav-join-sub">Free · Early drops · Exclusive content</span>
              </div>
            </>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          className={`nav-hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <ul className="nav-mobile-links">
          {NAV_LINKS.map(({ label, href }, i) => (
            <li key={href} style={{ '--i': i }}>
              <Link href={href} onClick={() => setMenuOpen(false)}>{label}</Link>
            </li>
          ))}
        </ul>
        <div className="nav-mobile-actions">
          {user ? (
            <Link href="/account/dashboard" className="nav-join" onClick={() => setMenuOpen(false)}>
              <span>My Account →</span>
            </Link>
          ) : (
            <Link href="/account" className="nav-join" onClick={() => setMenuOpen(false)}>
              <span>Get Access →</span>
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
