import Image from 'next/image'

export const metadata = {
  title:       'Merch | Algee Smith',
  description: 'Official Algee Smith merchandise. Drop coming soon.',
}

export default function MerchPage() {
  return (
    <div className="merch-page">

      {/* ─── Page Hero ─── */}
      <div className="page-hero">
        <div className="page-hero-label">Merchandise</div>
        <h1>
          Wear the <span className="italic">World.</span>
        </h1>
        <p className="page-hero-sub">
          Official Algee Smith drops. Limited runs. Direct to you.
        </p>
      </div>

      {/* ─── Drop 001 ─── */}
      <div className="merch-drop-section">
        <div className="merch-drop-inner reveal">

          {/* Shirt image */}
          <div className="merch-drop-visual">
            <div className="merch-drop-img-wrap">
              <Image
                src="/images/merch/love-lost-shirt.webp"
                alt="Love Lost Collection Shirt"
                width={560}
                height={560}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="merch-drop-badge">Drop 001</div>
          </div>

          {/* Info */}
          <div className="merch-drop-info">
            <div className="merch-soon-label">Love Lost Collection</div>

            <div className="merch-drop-title">
              The <span className="italic">Shirt.</span>
            </div>

            <p className="merch-soon-sub">
              A limited piece to accompany the album.
              Carries the feeling. Not just the logo.
            </p>

            <div className="merch-drop-details">
              <div className="merch-drop-detail">
                <span className="merch-detail-label">Price</span>
                <span className="merch-detail-value">$39.99</span>
              </div>
              <div className="merch-drop-detail">
                <span className="merch-detail-label">Status</span>
                <span className="merch-detail-value merch-status-live">Live Now</span>
              </div>
              <div className="merch-drop-detail">
                <span className="merch-detail-label">Run</span>
                <span className="merch-detail-value">Limited</span>
              </div>
            </div>

            <a
              href="https://algeesmith.mpodx.shop/"
              target="_blank"
              rel="noopener noreferrer"
              className="merch-shop-btn"
            >
              Shop Now →
            </a>

            <div className="merch-soon-note">
              Ships directly to you. Limited run — grab yours before it's gone.
            </div>
          </div>

        </div>
      </div>

      {/* Background text */}
      <div className="merch-bg-text" aria-hidden="true">MERCH</div>

    </div>
  )
}
