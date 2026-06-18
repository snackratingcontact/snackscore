"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder — integrer med email service som Resend eller Formspree
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-10 inline-block text-[#c96f7b] hover:underline">
          ← Back to Snackscore
        </Link>

        <h1 className="mb-2 text-5xl font-black tracking-tight">
          CONTACT <span className="text-[#c96f7b]">US</span>
        </h1>
        <div className="mb-10 h-1 w-16 rounded-full bg-[#c96f7b]" />

        <p className="mb-10 text-white/70">
          Have a question, a suggestion, or just want to say hi? We'd love to hear from you. Reach us directly at{" "}
          <a href="mailto:snackratingcontact@gmail.com" className="text-[#c96f7b] hover:underline">
            snackratingcontact@gmail.com
          </a>{" "}
          or use the form below.
        </p>

        {sent ? (
          <div className="rounded-2xl border border-[#c96f7b]/30 bg-[#c96f7b]/5 p-8 text-center">
            <div className="mb-3 text-4xl">🎉</div>
            <h2 className="mb-2 text-xl font-black">Message sent!</h2>
            <p className="text-white/60">Thanks for reaching out — we'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-white/60">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#c96f7b]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-white/60">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#c96f7b]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-white/60">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                required
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#c96f7b]"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#c96f7b] px-6 py-3 text-sm font-black text-white transition hover:bg-[#d9828d]"
            >
              Send Message →
            </button>
          </form>
        )}
      </div>
    </main>
  );
}