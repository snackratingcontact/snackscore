"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function QuickScorePage() {
  const router = useRouter();
  const [snack, setSnack] = useState<any>(null);
  const [snacksByTier, setSnacksByTier] = useState<Record<number, any[]>>({});
  const [allSnacks, setAllSnacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rated, setRated] = useState(0);
  const [totalSnacks, setTotalSnacks] = useState(0);
  const [ratedCount, setRatedCount] = useState(0);
  const [previousSnack, setPreviousSnack] = useState<any>(null);
  const [previousRating, setPreviousRating] = useState<number | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    const { data: all } = await supabase
      .from("snacks")
      .select("*")
      .eq("approved", true)
      .order("popularity_tier", { ascending: true });

    const allList = all || [];
    setAllSnacks(allList);
    setTotalSnacks(allList.length);

    // Grupper efter tier
    const byTier: Record<number, any[]> = {};
    for (let t = 1; t <= 5; t++) {
      byTier[t] = allList.filter((s: any) => s.popularity_tier === t);
    }
    setSnacksByTier(byTier);

    const ratedCount = allList.filter((s: any) =>
      localStorage.getItem(`snackscore-rating-${s.slug}`)
    ).length;
    setRatedCount(ratedCount);

    pickNextFromTiers(byTier);
    setLoading(false);
  }

  function pickNextFromTiers(byTier: Record<number, any[]>) {
    for (let t = 1; t <= 5; t++) {
      const unrated = (byTier[t] || []).filter(
        (s) => !localStorage.getItem(`snackscore-rating-${s.slug}`)
      );
      if (unrated.length > 0) {
        const random = unrated[Math.floor(Math.random() * unrated.length)];
        setSnack(random);
        return;
      }
    }
    setSnack(null);
  }

  function pickNextSnack() {
    pickNextFromTiers(snacksByTier);
  }

  async function handleRate(rating: number) {
    if (!snack || submitting) return;
    setSubmitting(true);

    const newRatingsTotal = (snack.ratings_total || 0) + rating;
    const newRatingsCount = (snack.ratings_count || 0) + 1;
    const newScore = Number((newRatingsTotal / newRatingsCount).toFixed(1));

    await supabase
      .from("snacks")
      .update({
        ratings_total: newRatingsTotal,
        ratings_count: newRatingsCount,
        score: newScore,
      })
      .eq("id", snack.id);

    localStorage.setItem(`snackscore-rating-${snack.slug}`, String(rating));

    setPreviousSnack(snack);
    setPreviousRating(rating);

    setRated((prev) => prev + 1);
    setRatedCount((prev) => prev + 1);
    setSubmitting(false);
    pickNextSnack();
  }

  async function handleUndo() {
    if (!previousSnack || previousRating === null) return;

    const revertedTotal = (previousSnack.ratings_total || 0);
    const revertedCount = (previousSnack.ratings_count || 0);
    const revertedScore = revertedCount > 0
      ? Number(((revertedTotal - previousRating) / (revertedCount - 1)).toFixed(1))
      : 0;

    await supabase
      .from("snacks")
      .update({
        ratings_total: revertedTotal - previousRating,
        ratings_count: Math.max(revertedCount - 1, 0),
        score: revertedCount - 1 > 0 ? revertedScore : 0,
      })
      .eq("id", previousSnack.id);

    localStorage.removeItem(`snackscore-rating-${previousSnack.slug}`);

    setSnack(previousSnack);
    setPreviousSnack(null);
    setPreviousRating(null);
    setRated((prev) => Math.max(prev - 1, 0));
    setRatedCount((prev) => Math.max(prev - 1, 0));
  }

  function handleSkip() {
    pickNextSnack();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">Loading...</main>
    );
  }

  if (!snack) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-6xl">🎉</div>
          <h1 className="mb-2 text-3xl font-black">You rated everything!</h1>
          <p className="mb-8 text-white/50">You scored {rated} snacks this session.</p>
          <Link href="/" className="rounded-xl bg-[#c96f7b] px-6 py-3 font-bold text-black">
            Back to Snackscore
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 text-white">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="mb-2 flex items-center justify-between">
            <Link href="/" className="flex-1 text-sm text-[#c96f7b]">
              ← Back
            </Link>
            <button
              onClick={handleUndo}
              disabled={!previousSnack}
              className="text-sm text-[#c96f7b]/70 transition hover:text-[#c96f7b] disabled:opacity-90 disabled:cursor-not-allowed"
            >
              ↩ Undo
            </button>
            <span className="flex-1 text-right text-sm text-[#c96f7b]">Rated this session: {rated}</span>
          </div>

          <div className="mb-8 rounded-3xl bg-white/5 p-8">
            {snack.image_url ? (
              <img
                src={snack.image_url}
                alt={snack.name}
                className="h-80 w-full object-contain"
              />
            ) : (
              <div className="flex h-80 w-full items-center justify-center text-[#c96f7b]/60">
                No image
              </div>
            )}
          </div>

          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-1 text-3xl font-black">{snack.name}</h1>
              <p className="text-base text-[#c96f7b]/80">{snack.brand} · {snack.category}</p>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 px-5 py-4 text-center">
                <div className="text-xs text-white/50">Score</div>
                <div className="mt-1 text-2xl font-black text-[#c96f7b]">
                  {snack.ratings_count > 0 ? `⭐ ${snack.score}` : "N/A"}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 px-5 py-4 text-center">
                <div className="text-xs text-white/50">Ratings</div>
                <div className="mt-1 text-2xl font-black text-[#c96f7b]">
                  {snack.ratings_count}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-10 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRate(rating)}
                disabled={submitting}
                className="h-12 rounded-lg bg-white/10 font-black text-base text-white transition hover:bg-[#c96f7b] hover:text-white disabled:opacity-50"
              >
                {rating}
              </button>
            ))}
          </div>

          {totalSnacks > 0 && (
            <div className="mb-5 w-full">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#c96f7b] transition-all"
                  style={{
                    width: `${Math.min((ratedCount / totalSnacks) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-widest text-[#c96f7b]">
                <span>{ratedCount} of {totalSnacks} snacked</span>
                <span>{Math.round((ratedCount / totalSnacks) * 100)}%</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSkip}
            className="w-full rounded-xl bg-white/5 py-4 text-base font-semibold text-white/50 transition hover:bg-white/10"
          >
            Skip
          </button>
        </div>
      </div>
    </main>
  );
}