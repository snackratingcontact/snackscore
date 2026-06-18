"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Fast Food",
  "Chips",
  "Chocolate",
  "Candy",
  "Beverages",
  "Cakes/Cookies",
  "Dairy",
];

export default function LeaderboardPage() {
  const [snacks, setSnacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchSnacks() {
      const { data } = await supabase
        .from("snacks")
        .select("*")
        .eq("approved", true)
        .gt("ratings_count", 0)
        .order("score", { ascending: false });

      if (data) {
        setSnacks(data);
        const ratings: Record<string, number> = {};
        data.forEach((snack) => {
          const saved = localStorage.getItem(`snackscore-rating-${snack.slug}`);
          if (saved) ratings[snack.slug] = Number(saved);
        });
        setUserRatings(ratings);
      }
      setLoading(false);
    }
    fetchSnacks();
  }, []);

  const top10 = snacks.slice(0, 10);

  const topPerCategory = CATEGORIES.map((cat) => ({
    category: cat,
    snacks: snacks.filter((s) => s.category === cat).slice(0, 3),
  })).filter((g) => g.snacks.length > 0);

  const mostRated = [...snacks].sort((a, b) => b.ratings_count - a.ratings_count)[0];
  const highestScore = snacks[0];
  const lowestScore = [...snacks].sort((a, b) => a.score - b.score)[0];

  if (loading) {
    return <main className="min-h-screen bg-black p-10 text-white">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-14 text-white md:px-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="mb-6 inline-block text-sm text-[#c96f7b] hover:underline">
            ← Back to Snackscore
          </Link>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            LEADER<span className="text-[#c96f7b]">BOARD</span>
          </h1>
          <p className="mt-4 text-white/50">The highest rated snacks across all categories</p>
        </div>

        {/* Top 3 Podium */}
        {top10.length >= 3 && (
          <section className="mb-16">
            <div className="flex items-end justify-center gap-4">
              {/* #2 */}
              <div className="flex w-48 flex-col items-center">
                <Link href={`/${top10[1].slug}`} className="group w-full">
                  <div className="mb-3 flex flex-col items-center">
                    <span className="mb-2 text-2xl font-black text-white/40">#2</span>
                    {top10[1].image_url ? (
                      <img src={top10[1].image_url} alt={top10[1].name} className="h-24 w-full object-contain" />
                    ) : (
                      <div className="h-24 w-full" />
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center transition group-hover:border-[#c96f7b]/40">
                    <p className="text-sm font-bold leading-snug text-white">{top10[1].name}</p>
                    <p className="mt-1 text-xs text-white/40">{top10[1].brand}</p>
                    <p className="mt-2 text-2xl font-black text-[#c96f7b]">⭐ {top10[1].score}</p>
                    <p className="text-xs text-white/30">{top10[1].ratings_count} ratings</p>
                  </div>
                </Link>
                <div className="mt-2 h-16 w-full rounded-t-xl bg-white/10" />
              </div>

              {/* #1 */}
              <div className="flex w-56 flex-col items-center">
                <div className="mb-2 text-4xl">🏆</div>
                <Link href={`/${top10[0].slug}`} className="group w-full">
                  <div className="mb-3 flex flex-col items-center">
                    <span className="mb-2 text-3xl font-black text-[#F5C518]">#1</span>
                    {top10[0].image_url ? (
                      <img src={top10[0].image_url} alt={top10[0].name} className="h-32 w-full object-contain" />
                    ) : (
                      <div className="h-32 w-full" />
                    )}
                  </div>
                  <div className="rounded-2xl border-2 border-[#F5C518]/50 bg-[#F5C518]/5 p-4 text-center transition group-hover:border-[#F5C518]">
                    <p className="text-base font-black leading-snug text-white">{top10[0].name}</p>
                    <p className="mt-1 text-xs text-white/40">{top10[0].brand}</p>
                    <p className="mt-2 text-3xl font-black text-[#F5C518]">⭐ {top10[0].score}</p>
                    <p className="text-xs text-white/30">{top10[0].ratings_count} ratings</p>
                  </div>
                </Link>
                <div className="mt-2 h-24 w-full rounded-t-xl bg-[#F5C518]/20" />
              </div>

              {/* #3 */}
              <div className="flex w-48 flex-col items-center">
                <Link href={`/${top10[2].slug}`} className="group w-full">
                  <div className="mb-3 flex flex-col items-center">
                    <span className="mb-2 text-2xl font-black text-white/40">#3</span>
                    {top10[2].image_url ? (
                      <img src={top10[2].image_url} alt={top10[2].name} className="h-24 w-full object-contain" />
                    ) : (
                      <div className="h-24 w-full" />
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center transition group-hover:border-[#c96f7b]/40">
                    <p className="text-sm font-bold leading-snug text-white">{top10[2].name}</p>
                    <p className="mt-1 text-xs text-white/40">{top10[2].brand}</p>
                    <p className="mt-2 text-2xl font-black text-[#c96f7b]">⭐ {top10[2].score}</p>
                    <p className="text-xs text-white/30">{top10[2].ratings_count} ratings</p>
                  </div>
                </Link>
                <div className="mt-2 h-10 w-full rounded-t-xl bg-white/10" />
              </div>
            </div>
          </section>
        )}

        {/* #4 - #10 liste */}
        {top10.length > 3 && (
          <section className="mb-16">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <span className="h-6 w-1 rounded-full bg-[#c96f7b]" />
              Top 4–10
            </h2>
            <div className="flex flex-col gap-3">
              {top10.slice(3).map((snack, i) => (
                <Link
                  key={snack.id}
                  href={`/${snack.slug}`}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-[#c96f7b]/40 hover:-translate-y-0.5"
                >
                  <span className="w-8 text-center text-lg font-black text-white/30">#{i + 4}</span>
                  {snack.image_url ? (
                    <img src={snack.image_url} alt={snack.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-white/5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-white">{snack.name}</p>
                    <p className="text-xs text-white/40">{snack.brand} · {snack.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#c96f7b]">⭐ {snack.score}</p>
                    <p className="text-xs text-white/30">{snack.ratings_count} ratings</p>
                  </div>
                  {userRatings[snack.slug] && (
                    <div className="rounded-lg bg-[#c96f7b]/20 px-2 py-1 text-xs font-semibold text-[#c96f7b]">
                      Your score: {userRatings[snack.slug]}/10
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top 3 per kategori */}
        <section className="mb-16">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
            <span className="h-6 w-1 rounded-full bg-[#c96f7b]" />
            Top per Category
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {topPerCategory.map((group) => (
              <div key={group.category} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 font-black text-[#c96f7b]">{group.category}</h3>
                <div className="flex flex-col gap-2">
                  {group.snacks.map((snack, i) => (
                    <Link
                      key={snack.id}
                      href={`/${snack.slug}`}
                      className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5"
                    >
                      <span className="w-5 text-xs font-black text-white/30">#{i + 1}</span>
                      {snack.image_url ? (
                        <img src={snack.image_url} alt={snack.name} className="h-8 w-8 object-contain" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-white/5" />
                      )}
                      <span className="flex-1 text-sm font-semibold text-white">{snack.name}</span>
                      <span className="text-sm font-black text-[#c96f7b]">⭐ {snack.score}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hall of Fame stats */}
        <section>
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
            <span className="h-6 w-1 rounded-full bg-[#c96f7b]" />
            Hall of Fame
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {highestScore && (
              <Link href={`/${highestScore.slug}`} className="rounded-2xl border border-[#F5C518]/30 bg-[#F5C518]/5 p-5 transition hover:border-[#F5C518]/60">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#F5C518]">Highest Score</p>
                {highestScore.image_url && <img src={highestScore.image_url} alt={highestScore.name} className="mb-2 h-16 w-full object-contain" />}
                <p className="font-black text-white">{highestScore.name}</p>
                <p className="mt-1 text-2xl font-black text-[#F5C518]">⭐ {highestScore.score}</p>
              </Link>
            )}
            {mostRated && (
              <Link href={`/${mostRated.slug}`} className="rounded-2xl border border-[#c96f7b]/30 bg-[#c96f7b]/5 p-5 transition hover:border-[#c96f7b]/60">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#c96f7b]">Most Rated</p>
                {mostRated.image_url && <img src={mostRated.image_url} alt={mostRated.name} className="mb-2 h-16 w-full object-contain" />}
                <p className="font-black text-white">{mostRated.name}</p>
                <p className="mt-1 text-2xl font-black text-[#c96f7b]">{mostRated.ratings_count} ratings</p>
              </Link>
            )}
            {lowestScore && (
              <Link href={`/${lowestScore.slug}`} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">Lowest Score</p>
                {lowestScore.image_url && <img src={lowestScore.image_url} alt={lowestScore.name} className="mb-2 h-16 w-full object-contain" />}
                <p className="font-black text-white">{lowestScore.name}</p>
                <p className="mt-1 text-2xl font-black text-white/40">⭐ {lowestScore.score}</p>
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}