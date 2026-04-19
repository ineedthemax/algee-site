import Link from 'next/link'

export const metadata = {
  title: 'Join | Algee Smith',
  description: 'Choose your level of access. Free fan, Inner Circle, or the full bundle.',
}

const TIERS = [
  {
    id:       'free',
    name:     'Free Fan',
    price:    'Free',
    period:   'forever',
    tag:      null,
    color:    'tier-free',
    desc:     'Get in the world. Access to all public content.',
    features: [
      'Fan account & profile',
      'Full music catalog',
      'Film & video access',
      'First to see announcements',
    ],
    cta:      'Create Free Account',
    href:     '/account',
    ghost:    false,
  },
  {
    id:       'inner-circle',
    name:     'Inner Circle',
    price:    '$4.99',
    period:   'per month',
    tag:      'Most Popular',
    color:    'tier-inner',
    desc:     'Go deeper. Early access, exclusives, and a direct line.',
    features: [
      'Everything in Free',
      'Early access to new music',
      'Scorpion in Me — digital download',
      'Exclusive behind-the-scenes content',
      'Members-only updates from Algee',
      'First access to merch drops',
    ],
    cta:      'Coming Soon',
    href:     '/account',
    ghost:    false,
    soon:     true,
  },
  {
    id:       'bundle',
    name:     'The Bundle',
    price:    '$34.99',
    period:   'one-time',
    tag:      'Best Value',
    color:    'tier-bundle',
    desc:     'The full experience. Physical, digital, and exclusive.',
    features: [
      'Everything in Inner Circle',
      'Love Lost Collection shirt',
      'Signed digital poster (download)',
      'Scorpion in Me — digital download',
      '3 months Inner Circle included',
      'Your name in the credits',
    ],
    cta:      'Coming Soon',
    href:     '/account',
    ghost:    false,
    soon:     true,
  },
]

export default function JoinPage() {
  return (
    <div className="join-page">

      {/* Header */}
      <div className="page-hero" style={{ textAlign: 'center' }}>
        <div className="page-hero-label" style={{ justifyContent: 'center' }}>Membership</div>
        <h1>
          Choose your<br /><span className="italic">Access.</span>
        </h1>
        <p className="page-hero-sub" style={{ margin: '0 auto' }}>
          Three ways to be part of the world. Start free, go deeper when you&apos;re ready.
        </p>
      </div>

      {/* Tiers */}
      <div className="join-tiers-section">
        <div className="join-tiers-grid">
          {TIERS.map((tier) => (
            <div key={tier.id} className={`join-tier-card ${tier.color}${tier.id === 'inner-circle' ? ' tier-featured' : ''}`}>

              {/* Tag */}
              {tier.tag && (
                <div className="tier-tag">{tier.tag}</div>
              )}

              {/* Name + price */}
              <div className="tier-header">
                <div className="tier-name">{tier.name}</div>
                <div className="tier-price-wrap">
                  <span className="tier-price">{tier.price}</span>
                  <span className="tier-period">{tier.period}</span>
                </div>
              </div>

              <p className="tier-desc">{tier.desc}</p>

              <div className="tier-divider" />

              {/* Features */}
              <ul className="tier-features">
                {tier.features.map((f, i) => (
                  <li key={i}>
                    <span className="tier-check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="tier-cta-wrap">
                {tier.soon ? (
                  <div className="tier-soon-btn">
                    {tier.cta}
                    <span className="tier-soon-badge">Stripe coming soon</span>
                  </div>
                ) : (
                  <Link href={tier.href} className="tier-cta-btn">
                    {tier.cta}
                  </Link>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Scorpion in Me callout */}
      <div className="join-project-callout reveal">
        <div className="join-callout-inner">
          <div className="join-callout-label">New Project</div>
          <h2 className="join-callout-title">
            Scorpion<br /><span className="italic">in Me</span>
          </h2>
          <p className="join-callout-sub">
            Inner Circle members and bundle buyers get the first listen.
            Before the world hears it.
          </p>
          <Link href="/scorpion" className="btn btn-primary">
            <span>Learn More</span>
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>

      <div className="join-bg-text" aria-hidden="true">ACCESS</div>
    </div>
  )
}
