export const metadata = {
  title: 'Privacy Policy - Algee Smith',
  description: 'Privacy Policy for thealgeesmith.com operated by 7scope Entertainment.',
}

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-inner">

        <div className="legal-header">
          <div className="legal-label">Legal</div>
          <h1>Privacy <span className="italic">Policy.</span></h1>
          <p className="legal-meta">Effective Date: April 29, 2026 · 7scope Entertainment</p>
        </div>

        <div className="legal-body">

          <p>This Privacy Policy describes how 7scope Entertainment ("we," "us," or "our") collects, uses, and shares information about you when you use thealgeesmith.com (the "Site") and its related services.</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li><strong>Account information</strong> - email address, display name, phone number, and date of birth when you create an account or join the fan community.</li>
            <li><strong>Communications</strong> - messages, fan wall posts, and any content you submit through the Site.</li>
            <li><strong>Payment information</strong> - when you make a purchase, payment is processed securely by Stripe. We do not store your full card details.</li>
            <li><strong>Push notification preferences</strong> - if you opt in to push notifications, we store your subscription token to send you updates.</li>
          </ul>

          <p>We also collect certain information automatically when you use the Site:</p>
          <ul>
            <li>Log data (IP address, browser type, pages visited, time spent)</li>
            <li>Device information (operating system, device identifiers)</li>
            <li>Engagement data (missions completed, points earned, content accessed)</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and manage your fan account</li>
            <li>Send you music releases, announcements, and exclusive content you've signed up for</li>
            <li>Process purchases and send transaction confirmations</li>
            <li>Send push notifications (only if you opt in)</li>
            <li>Run fan engagement features including the points system, leaderboard, and Fan of the Month</li>
            <li>Improve and maintain the Site</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. How We Share Your Information</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li><strong>Service providers</strong> - third-party vendors that help us operate the Site, including Supabase (database), Stripe (payments), Resend (email), and Vercel (hosting). These providers are contractually obligated to protect your data.</li>
            <li><strong>Legal requirements</strong> - if required by law or to protect our rights and the safety of others.</li>
          </ul>

          <h2>4. SMS Communications</h2>
          <p>If you provide your phone number, you may receive SMS messages about new releases, events, and exclusive updates. Message and data rates may apply. You can opt out at any time by replying STOP to any message or by updating your account settings.</p>

          <h2>5. Push Notifications</h2>
          <p>With your permission, we may send push notifications to your browser or device. You can disable these at any time through your browser or device settings.</p>

          <h2>6. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us.</p>

          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:hello@thealgeesmith.com">hello@thealgeesmith.com</a>.</p>

          <h2>8. Children's Privacy</h2>
          <p>The Site is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with their information, please contact us and we will delete it.</p>

          <h2>9. Security</h2>
          <p>We take reasonable measures to protect your information from unauthorized access, loss, or misuse. However, no internet transmission is completely secure and we cannot guarantee absolute security.</p>

          <h2>10. Third-Party Links</h2>
          <p>The Site may contain links to third-party websites (streaming platforms, social media, etc.). We are not responsible for the privacy practices of those sites.</p>

          <h2>11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated effective date.</p>

          <h2>12. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact us at:</p>
          <p>
            <strong>7scope Entertainment</strong><br />
            <a href="mailto:hello@thealgeesmith.com">hello@thealgeesmith.com</a><br />
            <a href="https://www.thealgeesmith.com">www.thealgeesmith.com</a>
          </p>

        </div>
      </div>
    </div>
  )
}
