import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Snackscore",
  description: "Read Snackscore's privacy policy to understand how we handle your data and ratings.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-10 inline-block text-[#c96f7b] hover:underline">
          ← Back to Snackscore
        </Link>
        <h1 className="mb-2 text-5xl font-black tracking-tight">
          PRIVACY <span className="text-[#c96f7b]">POLICY</span>
        </h1>
        <div className="mb-2 h-1 w-16 rounded-full bg-[#c96f7b]" />
        <p className="mb-10 text-sm text-white/30">Last updated: June 2026</p>
        <div className="flex flex-col gap-8 text-white/70">
          <section>
            <h2 className="mb-3 text-xl font-black text-white">1. What we collect</h2>
            <p className="leading-relaxed">Snackscore does not require you to create an account. Your ratings and comments are stored locally in your browser using localStorage, linked to a randomly generated anonymous ID. We do not collect your name, email, or any personally identifiable information unless you contact us directly.</p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-white">2. How we use your data</h2>
            <p className="leading-relaxed">Ratings submitted through Snackscore are stored in our database to calculate average scores. These ratings are anonymous and cannot be traced back to you personally. If you submit a snack or contact us via email, we may use your email address to respond to your inquiry.</p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-white">3. Cookies & local storage</h2>
            <p className="leading-relaxed">We use localStorage to remember your ratings and preferences across sessions. We do not use tracking cookies or third-party advertising cookies.</p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-white">4. Third-party services</h2>
            <p className="leading-relaxed">Snackscore uses YouTube's API to display relevant video reviews on product pages. By using Snackscore, you are also subject to Google's Privacy Policy. We use Supabase to store snack data and ratings securely.</p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-white">5. Your rights</h2>
            <p className="leading-relaxed">You can clear your ratings and local data at any time by clearing your browser's localStorage. If you have submitted personal information and want it removed, contact us at <a href="mailto:snackratingcontact@gmail.com" className="text-[#c96f7b] hover:underline">snackratingcontact@gmail.com</a>.</p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-white">6. Contact</h2>
            <p className="leading-relaxed">For any privacy-related questions, reach us at <a href="mailto:snackratingcontact@gmail.com" className="text-[#c96f7b] hover:underline">snackratingcontact@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}