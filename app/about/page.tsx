"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-10 inline-block text-[#c96f7b] hover:underline">
          ← Back to Snackscore
        </Link>

        <h1 className="mb-2 text-5xl font-black tracking-tight">
          ABOUT <span className="text-[#c96f7b]">US</span>
        </h1>
        <div className="mb-10 h-1 w-16 rounded-full bg-[#c96f7b]" />

        {/* What is Snackscore */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-black">What is Snackscore?</h2>
          <p className="leading-relaxed text-white/70">
            Snackscore is a community-driven platform where snack lovers can discover, rate, and review their favourite snacks from around the world.
          </p>
          <p className="mt-4 leading-relaxed text-white/70">
            Every snack gets a score from 1 to 10 based on real ratings from real people. No algorithms, no sponsored placements.
          </p>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-black">How it works</h2>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-2 text-lg font-black text-[#c96f7b]">1. Browse</div>
              <p className="text-sm text-white/60">Explore hundreds of snacks across categories like Chips, Chocolate, Candy, Fast Food and more.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-2 text-lg font-black text-[#c96f7b]">2. Rate</div>
              <p className="text-sm text-white/60">Give each snack a score from 1–10. Use Quickscore to fly through snacks one by one, or rate directly from the homepage.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-2 text-lg font-black text-[#c96f7b]">3. Discover</div>
              <p className="text-sm text-white/60">See what the community rates highest, explore top lists by category, and find your next favourite snack.</p>
            </div>
          </div>
        </section>

        {/* Submit a snack */}
        <section className="mb-12 rounded-2xl border border-[#c96f7b]/30 bg-[#c96f7b]/5 p-6">
          <h2 className="mb-3 text-2xl font-black">Missing a snack?</h2>
          <p className="mb-5 text-white/70">
            Can't find your favourite snack on Snackscore? Submit it and help grow the community. Every submission is reviewed before going live.
          </p>
          <Link
            href="/submit"
            className="inline-block rounded-xl bg-[#c96f7b] px-6 py-3 text-sm font-black text-black transition hover:bg-[#d9828d]"
          >
            Submit a Snack →
          </Link>
        </section>

        {/* Support */}
        <section className="mb-12 rounded-2xl border border-[#F5C518]/30 bg-[#F5C518]/5 p-6">
          <h2 className="mb-3 text-2xl font-black">Support Snackscore</h2>
          <p className="mb-5 text-white/70">
            Snackscore is a passion project built and maintained by a small team. If you enjoy the platform and want to help keep it running and growing, consider supporting us. Every contribution helps us add more snacks, improve the site, and keep the lights on.
          </p>
          <a
            href="https://paypal.me/snackscore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#F5C518] px-6 py-3 text-sm font-black text-black transition hover:bg-[#e6b800]"
          >
            Support us
          </a>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-3 text-2xl font-black">Get in touch</h2>
          <p className="text-white/70">
            Have a question, suggestion, or want to get in touch? Reach us at{" "}
            <a href="mailto:snackratingcontact@gmail.com" className="text-[#c96f7b] hover:underline">
              snackratingcontact@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}