"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

async function submitRating(slug: string, rating: number) {
  localStorage.setItem(`snackscore-rating-${slug}`, String(rating));
  const { data: snack } = await supabase
    .from("snacks")
    .select("score, ratings_count")
    .eq("slug", slug)
    .single();
  if (!snack) return;
  const alreadyRated = localStorage.getItem(`snackscore-rating-${slug}`);
  if (alreadyRated) {
    const oldRating = Number(alreadyRated);
    const newScore = (snack.score * snack.ratings_count - oldRating + rating) / snack.ratings_count;
    await supabase.from("snacks").update({ score: Math.round(newScore * 10) / 10 }).eq("slug", slug);
  } else {
    const newCount = snack.ratings_count + 1;
    const newScore = ((snack.score * snack.ratings_count) + rating) / newCount;
    await supabase.from("snacks").update({ score: Math.round(newScore * 10) / 10, ratings_count: newCount }).eq("slug", slug);
  }
}

function RatingDropdown({ slug, currentRating, onRate }: { slug: string; currentRating?: number; onRate: (slug: string, rating: number) => void }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | undefined>(currentRating);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setSelected(currentRating); }, [currentRating]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative mt-2" onClick={(e) => e.preventDefault()}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((prev) => !prev); }}
        className="w-full rounded-lg bg-[#c96f7b]/70 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#c96f7b]"
      >
        {selected ? `Your score: ${selected}/10` : "Score"}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
          <div className="grid grid-cols-10 gap-1 p-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelected(num); setOpen(false); onRate(slug, num); }}
                className={`rounded-lg py-2 text-sm font-bold transition ${selected === num ? "bg-[#c96f7b] text-black" : "bg-white/5 text-white hover:bg-[#c96f7b] hover:text-black"}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const [snacks, setSnacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sortBy, setSortBy] = useState("a-z");

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function makeSlug(value: string) {
    return value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function formatTitle(value: string) {
    return value.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }

  useEffect(() => {
    async function fetchSnacks() {
      const { data } = await supabase.from("snacks").select("*").eq("approved", true);
      const filteredSnacks = (data || []).filter((snack) => makeSlug(snack.category) === categorySlug);
      setSnacks(filteredSnacks);

      const ratings: Record<string, number> = {};
      filteredSnacks.forEach((snack) => {
        const saved = localStorage.getItem(`snackscore-rating-${snack.slug}`);
        if (saved) ratings[snack.slug] = Number(saved);
      });
      setUserRatings(ratings);
      setLoading(false);
    }
    fetchSnacks();
  }, [categorySlug]);

  const handleRate = async (slug: string, rating: number) => {
    setUserRatings((prev) => ({ ...prev, [slug]: rating }));
    await submitRating(slug, rating);
  };

  const sortedSnacks = useMemo(() => {
    return [...snacks].sort((a, b) => {
      if (sortBy === "top-rated") return b.score - a.score;
      if (sortBy === "most-rated") return b.ratings_count - a.ratings_count;
      if (sortBy === "your-ratings") return (userRatings[b.slug] || 0) - (userRatings[a.slug] || 0);
      if (sortBy === "newest") return b.id - a.id;
      if (sortBy === "lowest-rated") return a.score - b.score;
      if (sortBy === "a-z") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [snacks, sortBy, userRatings]);

  return (
    <main className="min-h-screen bg-black px-10 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-8 inline-block text-[#c96f7b]">
          ← Back to Snackscore
        </Link>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="mb-1 text-4xl font-black">{formatTitle(categorySlug)}</h1>
            <p className="text-white/50">Showing all snacks in this category.</p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-2xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-medium text-white outline-none focus:border-[#c96f7b]"
          >
            <option value="top-rated">Top Rated</option>
            <option value="most-rated">Most Rated</option>
            <option value="your-ratings">Your Ratings</option>
            <option value="newest">Newest</option>
            <option value="lowest-rated">Lowest Rated</option>
            <option value="a-z">A-Z</option>
          </select>
        </div>

        {loading ? (
          <p className="text-white/50">Loading...</p>
        ) : snacks.length === 0 ? (
          <p className="text-white/50">No snacks found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {sortedSnacks.map((snack) => (
              <div
                key={snack.id}
                className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-1 hover:border-[#c96f7b]/40"
              >
                <Link href={`/${snack.slug}`} className="flex flex-col flex-1">
                  {snack.image_url ? (
                    <img src={snack.image_url} alt={snack.name} className="mb-3 h-28 w-full rounded-lg object-contain p-2" />
                  ) : (
                    <div className="mb-3 h-28 rounded-lg" />
                  )}
                  <div className="relative">
                    <h3 className="pr-12 text-base font-semibold leading-snug">{snack.name}</h3>
                    <span className="absolute right-0 top-0 text-sm font-semibold text-[#c96f7b]">
                      {snack.ratings_count > 0 ? `⭐ ${snack.score}` : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/45">{snack.brand}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">{snack.description}</p>
                </Link>
                <RatingDropdown slug={snack.slug} currentRating={userRatings[snack.slug]} onRate={handleRate} />
              </div>
            ))}
          </div>
        )}
      </div>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#c96f7b] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#d9828d]"
        >
          ↑ Back to top
        </button>
      )}
    </main>
  );
}