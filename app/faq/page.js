import Link from 'next/link'
import SchemaMarkup from '../components/SchemaMarkup'

export const metadata = {
  title: 'FAQ - Algee Smith | Common Questions Answered',
  description: 'Frequently asked questions about Algee Smith - his music, films, background, genre, and more.',
  openGraph: {
    title: 'Algee Smith FAQ',
    description: 'Common questions about Algee Smith answered - music, film, background, and more.',
  },
}

const FAQS = [
  {
    q: 'Who is Algee Smith?',
    a: 'Algee Smith is an actor, recording artist, entrepreneur, and philanthropist from Saginaw, Michigan. He is known for his roles in The Hate U Give, Euphoria on HBO, Detroit, and The New Edition Story on BET, as well as his debut studio album Love Lost.',
  },
  {
    q: 'Where is Algee Smith from?',
    a: 'Algee Smith is from Saginaw, Michigan.',
  },
  {
    q: 'What genre of music does Algee Smith make?',
    a: 'Algee Smith makes R&B and soul music. His debut album Love Lost was released in 2025.',
  },
  {
    q: 'What is Algee Smith\'s debut album?',
    a: 'Love Lost is Algee Smith\'s debut studio album, released in 2025. It is available on Spotify, Apple Music, Tidal, Amazon Music, and YouTube Music.',
  },
  {
    q: 'What movies and TV shows has Algee Smith been in?',
    a: 'Algee Smith has appeared in The Hate U Give (2018), Detroit (2017), Judas and the Black Messiah (2021), Euphoria on HBO (2019), The New Edition Story on BET (2017), Shooting Stars on Peacock (2023), Young Wild Free (2023), and The Gates (2026).',
  },
  {
    q: 'Who did Algee Smith play in Euphoria?',
    a: 'Algee Smith played Chris McKay in Euphoria on HBO.',
  },
  {
    q: 'Who did Algee Smith play in The Hate U Give?',
    a: 'Algee Smith played Khalil Harris in The Hate U Give (2018).',
  },
  {
    q: 'Who did Algee Smith play in The New Edition Story?',
    a: 'Algee Smith played Ralph Tresvant in The New Edition Story on BET (2017).',
  },
  {
    q: 'Where can I stream Algee Smith\'s music?',
    a: 'Algee Smith\'s music is available on Spotify, Apple Music, Tidal, Amazon Music, Deezer, and YouTube Music. His debut album Love Lost is streaming everywhere now.',
  },
  {
    q: 'Where can I watch The Gates?',
    a: 'The Gates is now streaming on Apple TV, YouTube, Google Play, and Fandango at Home.',
  },
  {
    q: 'How can I stay updated on Algee Smith\'s releases?',
    a: 'You can join the fan community at algeesmith.com to get early access, exclusive content, and direct updates from Algee.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
}

export default function FAQPage() {
  return (
    <div className="faq-page">
      <SchemaMarkup schema={faqSchema} />

      <div className="faq-inner">
        <div className="page-hero">
          <div className="page-hero-label">FAQ</div>
          <h1>Common <span className="italic">Questions.</span></h1>
          <p className="page-hero-sub">Everything people ask - answered directly.</p>
        </div>

        <div className="faq-list">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="faq-item">
              <h2 className="faq-q">{q}</h2>
              <p className="faq-a">{a}</p>
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <p>More questions? <Link href="/account" className="faq-link">Join the fan community →</Link></p>
        </div>
      </div>
    </div>
  )
}
