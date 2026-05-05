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
              <Link
                href={href}
                className={pathname === href || pathname?.startsWith(href + '/') ? 'nav-link-active' : ''}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA — desktop only */}
        <div className="nav-actions nav-actions-desktop">
          {/* Spotify listen pill */}
          <a
            href="https://open.spotify.com/artist/10gHoEHUPNcTFsyVR2YyeA"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-listen"
            aria-label="Listen on Spotify"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Listen
          </a>

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
          <a
            href="https://open.spotify.com/artist/10gHoEHUPNcTFsyVR2YyeA"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-listen nav-listen-mobile"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Listen on Spotify
          </a>
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
