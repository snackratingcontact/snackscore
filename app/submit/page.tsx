"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SubmitSnackPage() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function createSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let image_url = "";

    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${createSlug(name)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("snacks")
        .upload(fileName, image, { upsert: true });

      if (uploadError) {
        setMessage("Image upload failed.");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("snacks")
        .getPublicUrl(fileName);

      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("snacks").insert({
      name,
      brand,
      category,
      description,
      slug: createSlug(name),
      score: 0,
      ratings_count: 0,
      image_url,
      approved: false,
    });

    if (error) {
      setMessage("Something went wrong.");
      setLoading(false);
      return;
    }

    setMessage("Snack submitted!");
    setName("");
    setBrand("");
    setCategory("");
    setDescription("");
    setImage(null);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black px-10 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-8 inline-block text-[#c96f7b]">
          ← Back to Snackscore
        </Link>

        <h1 className="mb-8 text-5xl font-black">
          SUBMIT <span className="text-[#c96f7b]">SNACK</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            type="text"
            placeholder="Snack name"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4"
          />

          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            type="text"
            placeholder="Brand"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-[#c96f7b]"
          >
            <option className="bg-zinc-900 text-white" value="">
              Select category
            </option>
            <option className="bg-zinc-900 text-white" value="Chips">
              Chips
            </option>
            <option className="bg-zinc-900 text-white" value="Candy">
              Candy
            </option>
            <option className="bg-zinc-900 text-white" value="Chocolate">
              Chocolate
            </option>
            <option className="bg-zinc-900 text-white" value="Cookies">
              Cookies
            </option>
            <option className="bg-zinc-900 text-white" value="Drinks">
              Drinks
            </option>
            <option className="bg-zinc-900 text-white" value="Fast Food">
              Fast Food
            </option>
          </select>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 resize-none"
          />

          <div className="-mt-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer rounded-lg bg-[#c96f7b] px-4 py-2 text-sm font-bold text-white hover:bg-[#d9828d]"
              >
                Add image (optional)
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-white/50">
                {image ? image.name : "No file chosen"}
              </span>
            </div>
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="mt-4 h-40 w-full rounded-lg object-contain"
              />
            )}
          </div>

          <button
            disabled={loading}
            className="rounded-xl bg-[#c96f7b] px-6 py-4 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Submitting..." : "SUBMIT SNACK"}
          </button>

          {message && <p className="text-[#c96f7b]">{message}</p>}
        </form>
      </div>
    </main>
  );
}