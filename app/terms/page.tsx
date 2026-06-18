import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-10 inline-block text-[#c96f7b] hover:underline">
          ← Back to Snackscore
        </Link>

        <h1 className="mb-2 text-5xl font-black tracking-tight">
          TERMS OF <span className="text-[#c96f7b]">SERVICE</span>
        </h1>
        <div className="mb-2 h-1 w-16 rounded-full bg-[#c96f7b]" />
        <p className="mb-10 text-sm text-white/30">Last updated: June 2026</p>

        <div className="flex flex-col gap-8 text-white/70">
          <section>
            <h2 className="mb-3 text-xl font-black text-white">1. Acceptance of terms</h2>
            <p className="leading-relaxed">By accessing or using Snackscore, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the platform.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-white">2. Use of the platform</h2>
            <p className="leading-relaxed">Snackscore is provided for personal, non-commercial use. You agree not to misuse the platform, submit false or misleading ratings, spam the system, or attempt to manipulate snack scores. We reserve the right to remove any content or block access if these terms are violated.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-white">3. User-submitted content</h2>
            <p className="leading-relaxed">By submitting a snack, image, or comment, you grant Snackscore a non-exclusive right to display and use that content on the platform. You are responsible for ensuring that submitted content does not infringe on any third-party rights. Snackscore reviews all submissions before they go live.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-white">4. Ratings & scores</h2>
            <p className="leading-relaxed">Ratings on Snackscore are community-driven and do not represent the views of Snackscore or its team. Scores are calculated as an average of all submitted ratings and may change over time as more people rate a snack.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-white">5. Intellectual property</h2>
            <p className="leading-relaxed">The Snackscore name, logo, and design are the property of Snackscore. Product names, trademarks, and images belong to their respective owners. Snackscore is a fan-made, non-commercial platform. Product images are sourced from publicly available databases and are used purely for informational and identification purposes. If you are a rights holder and wish to have content removed, please contact us at <a href="mailto:snackratingcontact@gmail.com" className="text-[#c96f7b] hover:underline">snackratingcontact@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-white">6. Disclaimer</h2>
            <p className="leading-relaxed">Snackscore is provided "as is" without warranties of any kind. We are not responsible for any inaccuracies in snack information, user-submitted content, or any damages arising from the use of the platform.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-white">7. Changes to terms</h2>
            <p className="leading-relaxed">We may update these terms from time to time. Continued use of Snackscore after changes are posted constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-white">8. Contact</h2>
            <p className="leading-relaxed">Questions about these terms? Contact us at <a href="mailto:snackratingcontact@gmail.com" className="text-[#c96f7b] hover:underline">snackratingcontact@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}