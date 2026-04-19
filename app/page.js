import HeroSection from './components/HeroSection'
import FanWorldSection from './components/FanWorldSection'
import DynamicTextSlider from './components/DynamicTextSlider'

// Marquee items — duplicated for seamless infinite loop
const MARQUEE_ITEMS = [
  { text: 'Music',      italic: false, star: true  },
  { text: 'Film',       italic: true,  star: false },
  { text: 'Merch',      italic: false, star: true  },
  { text: 'Community',  italic: true,  star: false },
  { text: 'Two Stages', italic: false, star: true  },
  { text: 'One Soul',   italic: true,  star: false },
]

const allItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

export default function Home() {
  return (
    <>
      <HeroSection />

      {/* ─── Marquee ─── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {allItems.map((item, i) => (
            <span
              key={i}
              className={`marquee-item${item.italic ? ' italic' : ''}`}
            >
              {item.text}
              {item.star && (
                <span className="marquee-star">✦</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Dynamic Text Slider ─── */}
      <DynamicTextSlider />

      {/* ─── Fan World ─── */}
      <FanWorldSection />
    </>
  )
}
