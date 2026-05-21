import Link from 'next/link'

export const metadata = {
  title: '404 - Algee Smith',
  description: 'Page not found.',
}

export default function NotFound() {
  return (
    <div className="nf-page">
      <div className="nf-inner">
        <div className="nf-eyebrow">404</div>
        <h1 className="nf-headline">
          Lost in<br /><em>the world.</em>
        </h1>
        <p className="nf-sub">
          This page doesn&apos;t exist - but the music does.
        </p>
        <div className="nf-actions">
          <Link href="/" className="nf-btn-primary">Back to home →</Link>
          <Link href="/music" className="nf-btn-secondary">Stream music</Link>
        </div>
      </div>
      <div className="nf-bg" aria-hidden="true" />
    </div>
  )
}
