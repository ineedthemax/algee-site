export const metadata = {
  title:       'Merch | Algee Smith',
  description: 'Official Algee Smith merchandise. Drop coming soon.',
}

export default function MerchPage() {
  return (
    <div className="merch-page">

      {/* ─── Coming Soon ─── */}
      <div className="merch-coming-soon">
        <div className="merch-cs-eyebrow">Merchandise</div>
        <h1 className="merch-cs-title">
          Something's <span className="italic">Coming.</span>
        </h1>
        <p className="merch-cs-sub">
          The next drop is being put together. Stay locked in.
        </p>
        <div className="merch-cs-badge">Drop 002 · Coming Soon</div>
      </div>

      {/* Background text */}
      <div className="merch-bg-text" aria-hidden="true">MERCH</div>

    </div>
  )
}
