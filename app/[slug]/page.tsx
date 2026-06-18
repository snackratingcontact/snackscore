"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SnackPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [snack, setSnack] = useState<any>(null);
  const [allSnacks, setAllSnacks] = useState<any[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [userComment, setUserComment] = useState<any>(null);
  const [commentMessage, setCommentMessage] = useState("");
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageKey = `snackscore-rating-${slug}`;

  function getUserId() {
    let userId = localStorage.getItem("snackscore-user-id");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("snackscore-user-id", userId);
    }
    return userId;
  }

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getRatingButtonText() {
    if (!userRating) return "Submit Rating";
    if (selectedRating !== userRating) return "Update Rating";
    return "Rating submitted!";
  }

  function goToNextSnack() {
    // Grupper efter tier og find næste unrated
    for (let t = 1; t <= 5; t++) {
      const tierSnacks = allSnacks.filter((s: any) => s.popularity_tier === t);
      const unrated = tierSnacks.filter(
        (s) => s.slug !== slug && !localStorage.getItem(`snackscore-rating-${s.slug}`)
      );
      if (unrated.length > 0) {
        const random = unrated[Math.floor(Math.random() * unrated.length)];
        router.push(`/${random.slug}`);
        return;
      }
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !snack) return;
    setUploadingImage(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `pending-${slug}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("snacks").upload(fileName, file, { upsert: true });
    if (uploadError) { setMessage("Image upload failed."); setUploadingImage(false); return; }
    const { data: urlData } = supabase.storage.from("snacks").getPublicUrl(fileName);
    const { error: updateError } = await supabase.from("snacks").update({ pending_image_url: urlData.publicUrl }).eq("id", snack.id);
    if (updateError) { setMessage("Failed to save image."); setUploadingImage(false); return; }
    setMessage("Image submitted for review!");
    setUploadingImage(false);
  }

  async function fetchComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("snack_slug", slug)
      .order("created_at", { ascending: false });
    if (data) {
      setComments(data);
      const userId = getUserId();
      const mine = data.find((c) => c.user_id === userId);
      setUserComment(mine || null);
    }
  }

  async function fetchYoutubeVideos(snackName: string) {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const query = encodeURIComponent(`${snackName} review`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=3&key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.items) setYoutubeVideos(data.items);
    } catch (e) {
      console.error("YouTube fetch failed:", e);
    }
  }

  useEffect(() => {
    async function fetchSnack() {
      const { data } = await supabase.from("snacks").select("*").eq("slug", slug).single();
      setSnack(data);
      if (data?.name) fetchYoutubeVideos(data.name);
      const savedRating = localStorage.getItem(storageKey);
      if (savedRating) { setUserRating(Number(savedRating)); setSelectedRating(Number(savedRating)); }
    }
    async function fetchAllSnacks() {
      const { data } = await supabase.from("snacks").select("slug, popularity_tier").eq("approved", true);
      if (data) setAllSnacks(data);
    }
    fetchSnack();
    fetchAllSnacks();
    fetchComments();
  }, [slug, storageKey]);

  async function submitRating() {
    if (!selectedRating || !snack) return;
    if (userRating && selectedRating === userRating) return;
    let newRatingsTotal = snack.ratings_total || 0;
    let newRatingsCount = snack.ratings_count || 0;
    if (userRating) {
      newRatingsTotal = newRatingsTotal - userRating + selectedRating;
    } else {
      newRatingsTotal = newRatingsTotal + selectedRating;
      newRatingsCount = newRatingsCount + 1;
    }
    const newScore = Number((newRatingsTotal / newRatingsCount).toFixed(1));
    const { error } = await supabase.from("snacks").update({ ratings_total: newRatingsTotal, ratings_count: newRatingsCount, score: newScore }).eq("id", snack.id);
    if (error) { setMessage("Rating failed."); return; }
    localStorage.setItem(storageKey, String(selectedRating));
    setUserRating(selectedRating);
    setSnack({ ...snack, ratings_total: newRatingsTotal, ratings_count: newRatingsCount, score: newScore });
    setMessage(userRating ? "Rating updated!" : "Rating submitted!");
  }

  function removeRating() {
    localStorage.removeItem(storageKey);
    setUserRating(null);
    setSelectedRating(null);
    setMessage("Rating removed.");
  }

  async function submitComment() {
    const userId = getUserId();
    const content = commentText.trim();
    if (!content) return;
    if (userComment) {
      const { error } = await supabase.from("comments").update({ content }).eq("id", userComment.id);
      if (error) { setCommentMessage("Failed to update comment."); return; }
      setCommentMessage("Comment updated!");
    } else {
      const { error } = await supabase.from("comments").insert({ snack_slug: slug, user_id: userId, content });
      if (error) { setCommentMessage("Failed to post comment."); return; }
      setCommentMessage("Comment posted!");
    }
    await fetchComments();
    setCommentText("");
    setTimeout(() => setCommentMessage(""), 3000);
  }

  async function deleteComment() {
    if (!userComment) return;
    const { error } = await supabase.from("comments").delete().eq("id", userComment.id);
    if (error) { setCommentMessage("Failed to delete comment."); return; }
    setUserComment(null);
    setCommentText("");
    setCommentMessage("Comment deleted.");
    await fetchComments();
    setTimeout(() => setCommentMessage(""), 3000);
  }

  if (!snack) {
    return <main className="min-h-screen bg-black p-10 text-white">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-black px-10 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-4 inline-block text-[#c96f7b]">
          ← Back to Snackscore
        </Link>

        {snack.image_url ? (
          <img src={snack.image_url} alt={snack.name} className="h-[448px] w-full rounded-3xl bg-white/5 object-contain p-6" />
        ) : (
          <div className="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/20 bg-white/5">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {snack.pending_image_url ? (
              <p className="text-sm text-white/50">Image pending review</p>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="rounded-xl bg-[#c96f7b] px-6 py-3 font-bold text-white transition hover:bg-[#d9828d] disabled:opacity-50">
                {uploadingImage ? "Uploading..." : "ADD IMAGE"}
              </button>
            )}
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="rounded-2xl bg-white/5 p-5">
            <div className="mb-4 pb-4 border-b border-white/10">
              <h1 className="max-w-2xl text-2xl font-black leading-tight">{snack.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">{snack.description}</p>
            </div>

            {userRating && <p className="mb-3 text-sm text-white/50">Your current rating: {userRating}/10</p>}
            <div className="mb-4 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => { setSelectedRating(rating); setMessage(""); }}
                  className={`h-11 w-11 rounded-xl font-bold ${selectedRating === rating ? "bg-[#c96f7b] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={submitRating}
                disabled={Boolean(userRating && selectedRating === userRating)}
                className={`rounded-xl px-6 py-3 text-base font-bold ${
                  userRating && selectedRating === userRating
                    ? "cursor-default bg-green-600 text-white pointer-events-none"
                    : "bg-[#c96f7b] text-white"
                }`}
              >
                {getRatingButtonText()}
              </button>
              {userRating && (
                <button onClick={removeRating} className="rounded-xl bg-white/10 px-6 py-3 text-base font-bold text-white/50 transition hover:bg-[#c96f7b] hover:text-white">
                  Remove rating
                </button>
              )}
            </div>
            {message && <p className="mt-3 text-[#c96f7b]">{message}</p>}

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-2 flex flex-wrap gap-2">
                <Link href={`/category/${makeSlug(snack.category)}`} className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-[#c96f7b] transition hover:bg-white/20">{snack.category}</Link>
                <Link href={`/brand/${makeSlug(snack.brand)}`} className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-[#c96f7b] transition hover:bg-white/20">{snack.brand}</Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4" style={{ gridTemplateRows: "1fr 1fr 1fr" }}>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-4 text-center">
              <div className="text-sm text-white/50">Score</div>
              <div className="mt-1 text-4xl font-black text-[#c96f7b]">{snack.ratings_count > 0 ? snack.score : "N/A"}</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-4 text-center">
              <div className="text-sm text-white/50">Ratings</div>
              <div className="mt-1 text-4xl font-black text-[#c96f7b]">{snack.ratings_count}</div>
            </div>
            <button onClick={goToNextSnack} className="flex flex-col items-center justify-center rounded-2xl bg-[#c96f7b] p-4 text-center font-black text-white text-lg transition hover:bg-[#d9828d]">
              NEXT
            </button>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <span className="h-6 w-1 rounded-full bg-[#c96f7b]" />
            Comments ({comments.length})
          </h2>
          <div className="mb-6 rounded-2xl bg-white/5 p-4">
            <p className="mb-2 text-sm text-white/50">{userComment ? "Edit your comment:" : "Leave a comment:"}</p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What do you think about this snack?"
              maxLength={500}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#c96f7b]"
            />
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={submitComment}
                disabled={!commentText.trim()}
                className="rounded-xl bg-[#c96f7b] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#d9828d] disabled:opacity-40"
              >
                {userComment ? "Update" : "Post"}
              </button>
              {userComment && (
                <button onClick={deleteComment} className="text-sm text-white/40 transition hover:text-red-400">Delete</button>
              )}
              {commentMessage && <p className="text-sm text-[#c96f7b]">{commentMessage}</p>}
            </div>
          </div>
          {comments.length === 0 ? (
            <p className="text-sm text-white/40">No comments yet — be the first!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map((comment) => (
                <div key={comment.id} className={`rounded-xl border p-4 text-sm ${comment.user_id === getUserId() ? "border-[#c96f7b]/30 bg-[#c96f7b]/5" : "border-white/10 bg-white/5"}`}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-white/30">{comment.user_id === getUserId() ? "You" : "Anonymous"}</span>
                    <span className="text-xs text-white/20">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white/80">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {youtubeVideos.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <span className="h-6 w-1 rounded-full bg-[#c96f7b]" />
              YouTube Reviews
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {youtubeVideos.map((video) => (
                <a
                  key={video.id.videoId}
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden transition hover:border-[#c96f7b]/50"
                >
                  <div className="relative">
                    <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} className="w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <div className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">▶ Watch</div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-white">{video.snippet.title}</p>
                    <p className="mt-1 text-xs text-white/40">{video.snippet.channelTitle}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}