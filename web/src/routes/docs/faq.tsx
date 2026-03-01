import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const Route = createFileRoute('/docs/faq')({
  component: FAQPage,
})

const faqs = [
  {
    question: 'What makes falimy different from other family apps?',
    answer: 'falimy is privacy-first and self-hosted. Your family\'s data stays on your own PocketBase server - no cloud services, no third-party tracking, no data mining. You have complete control over your data.',
  },
  {
    question: 'Can I use falimy without technical knowledge?',
    answer: 'Absolutely! Setting up a PocketBase server requires Docker, which is beginner-friendly. The docker-compose.yml is pre-configured - just run one command. For reverse proxy (HTTPS), we provide ready-to-use configurations for Caddy and Nginx.',
  },
  {
    question: 'Does falimy work offline?',
    answer: 'Yes, on mobile devices. Lists and data are stored locally and sync when connected. On web, features work online-only due to browser limitations. For the best experience, use the mobile app which supports full offline functionality.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes! All data stays on your family\'s server, encrypted in transit (HTTPS). We use server-side invite validation, rate limiting, and input validation. Location sharing is opt-in with granular controls - you choose exactly when and with whom you share.',
  },
  {
    question: 'Can family members have different permissions?',
    answer: 'Yes! Admins can change member roles to "admin", "member", or "child". This allows parents to give children restricted access while maintaining full control for themselves. Child accounts may have limited features in future updates.',
  },
  {
    question: 'How many family members can join?',
    answer: 'There\'s no hard limit. Your family can be as large as you need. PocketBase is designed to handle thousands of records efficiently.',
  },
  {
    question: 'What happens if I change my server URL?',
    answer: 'Simply update the server URL in falimy settings. Your family ID and account remain the same - you\'ll just connect to a different location of the same data.',
  },
  {
    question: 'Can I join multiple families?',
    answer: 'Currently, each account belongs to one family. We\'re exploring multi-family support for future versions based on user feedback.',
  },
  {
    question: 'Is falimy open source?',
    answer: 'Yes! The entire falimy project is open source on GitHub. You can inspect the code, contribute, or self-host with modifications. Privacy shouldn\'t require trust in a black box.',
  },
  {
    question: 'What about notifications?',
    answer: 'Push notifications via ntfy.sh are planned for future releases. Currently, you\'ll see updates when you open the app. Geofence triggers work in real-time when the app is open.',
  },
]

function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground font-medium">
              Common questions about falimy, privacy, and self-hosting.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group">
                <summary className="list-none flex cursor-pointer items-start gap-3 p-4 bg-card rounded-2xl border-2 border-black hover:bg-muted/30 transition-colors dark:border-white/25">
                  <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    {faq.question}
                  </div>
                </summary>
                <div className="px-4 py-4 text-muted-foreground font-medium">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
