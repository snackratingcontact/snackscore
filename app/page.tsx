"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const EXCLUDED_CATEGORIES = ["Spreads"];
const CATEGORY_ORDER = [
  "Fast Food",
  "Chips",
  "Chocolate",
  "Candy",
  "Beverages",
  "Cakes/Cookies",
  "Dairy",
];

async function submitRating(slug: string, rating: number) {
  const existingRating = localStorage.getItem(`snackscore-rating-${slug}`);

  const { data: snack } = await supabase
    .from("snacks")
    .select("score, ratings_count, ratings_total")
    .eq("slug", slug)
    .single();
  if (!snack) return;

  let newCount = snack.ratings_count;
  let newTotal = snack.ratings_total ?? Math.round(snack.score * snack.ratings_count);

  if (existingRating) {
    newTotal = newTotal - Number(existingRating) + rating;
  } else {
    newTotal = newTotal + rating;
    newCount = newCount + 1;
  }

  const newScore = Math.round((newTotal / newCount) * 10) / 10;

  localStorage.setItem(`snackscore-rating-${slug}`, String(rating));

  await supabase
    .from("snacks")
    .update({ score: newScore, ratings_count: newCount, ratings_total: newTotal })
    .eq("slug", slug);
}

function RatingDropdown({
  slug,
  currentRating,
  onRate,
}: {
  slug: string;
  currentRating?: number;
  onRate: (slug: string, rating: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | undefined>(currentRating);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(currentRating);
  }, [currentRating]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative mt-2" onClick={(e) => e.preventDefault()}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={`w-full rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          selected
            ? "bg-[#c96f7b]/70 text-black hover:bg-[#c96f7b]"
            : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
        }`}
      >
        {selected ? `Your score: ${selected}/10` : "Rate this snack"}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
          <div className="grid grid-cols-10 gap-1 p-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelected(num);
                  setOpen(false);
                  onRate(slug, num);
                }}
                className={`rounded-lg py-2 text-sm font-bold transition ${
                  selected === num
                    ? "bg-[#c96f7b] text-black"
                    : "bg-white/5 text-white hover:bg-[#c96f7b] hover:text-black"
                }`}
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

export default function Home() {
  const [snacks, setSnacks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("top-rated");
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [visibleCount, setVisibleCount] = useState(25);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(document.documentElement.scrollTop > 999);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchSnacks() {
      let allSnacks: any[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data } = await supabase
          .from("snacks")
          .select("*")
          .eq("approved", true)
          .range(from, from + pageSize - 1);
        if (!data || data.length === 0) break;
        allSnacks = [...allSnacks, ...data];
        if (data.length < pageSize) break;
        from += pageSize;
      }
      setSnacks(allSnacks);
    }
    fetchSnacks();
  }, []);

  useEffect(() => {
    const ratings: Record<string, number> = {};
    snacks.forEach((snack) => {
      const savedRating = localStorage.getItem(`snackscore-rating-${snack.slug}`);
      if (savedRating) ratings[snack.slug] = Number(savedRating);
    });
    setUserRatings(ratings);
  }, [snacks]);

  useEffect(() => {
    setVisibleCount(25);
  }, [search, selectedCategory, sortBy]);

  const handleRate = async (slug: string, rating: number) => {
    setUserRatings((prev) => ({ ...prev, [slug]: rating }));
    await submitRating(slug, rating);
  };

  const categories = useMemo(() => {
    const cats = snacks.map((snack) => snack.category);
    return ["All", ...Array.from(new Set(cats)).sort()];
  }, [snacks]);

  const categoryGroups = useMemo(() => {
    return CATEGORY_ORDER.filter((cat) => !EXCLUDED_CATEGORIES.includes(cat))
      .map((cat) => ({
        category: cat,
        snacks: [...snacks]
          .filter((s) => s.category === cat && s.ratings_count > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5),
      }))
      .filter((g) => g.snacks.length > 0);
  }, [snacks]);

  const filteredSnacks = snacks.filter((snack) => {
    const matchesSearch = snack.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || snack.category === selectedCategory;
    const matchesUserRatings = sortBy !== "your-ratings" || Boolean(userRatings[snack.slug]);
    return matchesSearch && matchesCategory && matchesUserRatings;
  });

  const sortedSnacks = [...filteredSnacks].sort((a, b) => {
    if (sortBy === "top-rated") return b.score - a.score;
    if (sortBy === "most-rated") return b.ratings_count - a.ratings_count;
    if (sortBy === "your-ratings") return (userRatings[b.slug] || 0) - (userRatings[a.slug] || 0);
    if (sortBy === "newest") return b.id - a.id;
    if (sortBy === "lowest-rated") return a.score - b.score;
    if (sortBy === "a-z") return a.name.localeCompare(b.name);
    if (sortBy === "random") return Math.random() - 0.5;
    return 0;
  });

  const visibleSnacks = sortedSnacks.slice(0, visibleCount);

  const suggestions = snacks
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) && search.trim() !== "")
    .slice(0, 6);

  const sectionLabel = {
    "top-rated": "Top Rated",
    "most-rated": "Most Rated",
    "your-ratings": "Your Ratings",
    "newest": "Newest",
    "lowest-rated": "Lowest Rated",
    "a-z": "A-Z",
    "random": "Random",
  }[sortBy] ?? "All";

  const categoryLabel = selectedCategory === "All" ? "Snacks" : selectedCategory;

  function makeCategorySlug(value: string) {
    return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function TopSnackCard({ snack, index }: { snack: any; index: number }) {
    return (
      <div className="relative flex h-full flex-col rounded-xl border border-[#c96f7b]/25 bg-white/5 p-4 transition-all hover:-translate-y-1 hover:border-[#c96f7b]/50">
        <Link href={`/${snack.slug}`} className="flex flex-col flex-1">
          <div className="mb-2 text-sm font-semibold text-[#c96f7b]">#{index + 1}</div>
          {snack.image_url ? (
            <img
              src={snack.image_url}
              alt={snack.name}
              className="mb-2 h-20 w-full object-contain p-1"
            />
          ) : (
            <div className="mb-2 h-20" />
          )}
          <div className="relative">
          <h3 className="pr-12 text-base font-semibold leading-snug">{snack.name}</h3>
          <span className="absolute right-0 top-0 text-sm font-semibold text-[#c96f7b]">
             {snack.score ? `⭐ ${snack.score}` : ""}
          </span>
        </div>
        </Link>
        <RatingDropdown
          slug={snack.slug}
          currentRating={userRatings[snack.slug]}
          onRate={handleRate}
        />
      </div>
    );
  }

  return (
    <main className="bg-black px-6 py-14 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <img
              src="/burger-icon-final2.svg"
              alt="Snackscore icon"
              className="h-[51px] w-[51px] object-contain mt-[0px]"
            />
            <h1 className="text-5xl font-black tracking-tight md:text-7xl">
              SNACK<span className="text-[#c96f7b]">SCORE</span>
            </h1>
          </div>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            Discover and rate all the popular snacks in the world!
          </p>
          <Link
            href="/leaderboard"
            className="mt-6 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
            🏆 Leaderboard
            </Link>
        </header>

        {/* Sticky navigation sektion */}
        <div className="sticky top-0 z-40 bg-black pb-4 pt-8">
          <div className="mb-4 flex flex-col items-center gap-2 md:flex-row md:justify-center">
            <Link
              href="/quickscore"
              className="w-full h-[58px] flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-base font-normal text-white/70 transition hover:border-white/20 hover:text-white md:w-auto"
            >
              Quickscore
            </Link>
            <Link
              href="/submit"
              className="w-full h-[58px] flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-base font-normal text-white/70 transition hover:border-white/20 hover:text-white md:w-auto"
            >
              Submit Snack
            </Link>
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search snacks..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-normal text-white outline-none transition placeholder:text-white/40 focus:border-[#c96f7b]"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                  {suggestions.map((s) => (
                    <li
                      key={s.id}
                      onMouseDown={() => { setSearch(s.name); setShowSuggestions(false); }}
                      className="cursor-pointer border-b border-white/5 px-5 py-3 text-sm text-white last:border-0 hover:bg-white/10"
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-6 py-4 text-base font-medium text-white outline-none focus:border-[#c96f7b] md:w-56"
            >
              <option value="top-rated">Top Rated</option>
              <option value="most-rated">Most Rated</option>
              <option value="your-ratings">Your Ratings</option>
              <option value="newest">Newest</option>
              <option value="lowest-rated">Lowest Rated</option>
              <option value="a-z">A-Z</option>
              <option value="random">Random</option>
            </select>
          </div>

          <div className="mb-4 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === category
                    ? "bg-[#c96f7b] text-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {snacks.length > 0 && (
            <div className="flex justify-center">
              <div className="w-full max-w-[55rem]">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#c96f7b] transition-all"
                    style={{
                      width: `${Math.min((Object.keys(userRatings).length / snacks.length) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-widest text-[#c96f7b]">
                  <span>{Object.keys(userRatings).length} of {snacks.length} snacked</span>
                  <span>{Math.round((Object.keys(userRatings).length / snacks.length) * 100)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* All Snacks */}
        <section className="mb-10 mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="h-7 w-1 rounded-full bg-[#c96f7b]" />
            {sectionLabel} {categoryLabel}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {visibleSnacks.map((snack) => (
              <div
                key={snack.id}
                className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-1 hover:border-[#c96f7b]/40"
              >
                <Link href={`/${snack.slug}`} className="flex flex-col flex-1">
                  {snack.image_url ? (
                    <img
                      src={snack.image_url}
                      alt={snack.name}
                      className="mb-3 h-28 w-full rounded-lg object-contain p-2"
                    />
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
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
                    {snack.description}
                  </p>
                </Link>
                <RatingDropdown
                  slug={snack.slug}
                  currentRating={userRatings[snack.slug]}
                  onRate={handleRate}
                />
              </div>
            ))}
          </div>

          {visibleSnacks.length === 0 && (
            <p className="mt-6 text-sm text-white/50">No snacks found for this filter.</p>
          )}

          {visibleCount < sortedSnacks.length && (
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => setVisibleCount((prev) => prev + 25)}
                className="rounded-xl bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#c96f7b] hover:text-black"
              >
                Show More ({sortedSnacks.length - visibleCount} remaining)
              </button>
              <button
                onClick={() => setVisibleCount(sortedSnacks.length)}
                className="rounded-xl bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#c96f7b] hover:text-black"
              >
                Show All ({sortedSnacks.length})
              </button>
            </div>
          )}
        </section>

        {/* Top per kategori */}
        {categoryGroups.map((group) => (
          <section key={group.category} className="mb-10">
            <h2 className="mb-4 flex items-center justify-between text-2xl font-bold tracking-tight">
              <div className="flex items-center gap-2">
                <span className="h-7 w-1 rounded-full bg-[#c96f7b]" />
                Top {group.category}
              </div>
              <Link
                href={`/category/${makeCategorySlug(group.category)}`}
                className="text-sm font-medium text-white/40 transition hover:text-[#c96f7b]"
              >
                See all →
              </Link>
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {group.snacks.map((snack, index) => (
                <TopSnackCard key={snack.id} snack={snack} index={index} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 py-10 text-center text-sm text-white/30">
        <div className="mb-4 text-2xl font-black text-white">
          SNACK<span className="text-[#c96f7b]">SCORE</span>
        </div>
        <div className="mb-4 flex justify-center gap-6 text-white/40">
          <a href="/about" className="transition hover:text-[#c96f7b]">About</a>
          <a href="/contact" className="transition hover:text-[#c96f7b]">Contact</a>
          <a href="/privacy" className="transition hover:text-[#c96f7b]">Privacy Policy</a>
          <a href="/terms" className="transition hover:text-[#c96f7b]">Terms of Service</a>
        </div>
        <p className="text-white/20">© 2026 Snackscore. All rights reserved.</p>
      </footer>

      {/* Back to top knap */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#c96f7b] px-5 py-3 text-sm font-semibold text-black/90 shadow-lg transition hover:bg-[#d9828d]"
        >
          ↑ Back to top
        </button>
      )}
    </main>
  );
}