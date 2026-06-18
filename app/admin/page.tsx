"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = "Lmaokekw1337!";

const categories = [
  "Beverages",
  "Candy",
  "Chocolate",
  "Chips",
  "Cakes/Cookies",
  "Fast-food",
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [snacks, setSnacks] = useState<any[]>([]);
  const [pendingImages, setPendingImages] = useState<any[]>([]);

  function handleLogin() {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  useEffect(() => {
    if (!authed) return;
    fetchPendingSnacks();
    fetchPendingImages();
  }, [authed]);

  async function fetchPendingSnacks() {
    const { data, error } = await supabase
      .from("snacks")
      .select("*")
      .eq("approved", false)
      .order("created_at", { ascending: false });

    if (error) { console.error(error); return; }
    setSnacks(data || []);
  }

  async function fetchPendingImages() {
    const { data, error } = await supabase
      .from("snacks")
      .select("*")
      .eq("approved", true)
      .not("pending_image_url", "is", null)
      .order("created_at", { ascending: false });

    if (error) { console.error(error); return; }
    setPendingImages(data || []);
  }

  async function approveImage(snack: any) {
    const { error } = await supabase
      .from("snacks")
      .update({ image_url: snack.pending_image_url, pending_image_url: null })
      .eq("id", snack.id);

    if (error) { alert("Could not approve image"); return; }
    setPendingImages((prev) => prev.filter((s) => s.id !== snack.id));
  }

  async function rejectImage(snack: any) {
    const { error } = await supabase
      .from("snacks")
      .update({ pending_image_url: null })
      .eq("id", snack.id);

    if (error) { alert("Could not reject image"); return; }
    setPendingImages((prev) => prev.filter((s) => s.id !== snack.id));
  }

  function updateLocalSnack(id: string, field: string, value: string) {
    setSnacks((prev) =>
      prev.map((snack) =>
        snack.id === id ? { ...snack, [field]: value } : snack
      )
    );
  }

  async function saveSnack(snack: any) {
    const { error } = await supabase
      .from("snacks")
      .update({
        name: snack.name,
        description: snack.description,
        category: snack.category,
        image_url: snack.image_url,
      })
      .eq("id", snack.id);

    if (error) { console.error(error); alert("Could not save snack"); return; }
    alert("Snack saved");
  }

  async function approveSnack(id: string) {
    const { error } = await supabase
      .from("snacks")
      .update({ approved: true })
      .eq("id", id);

    if (error) { console.error(error); return; }
    setSnacks((prev) => prev.filter((snack) => snack.id !== id));
  }

  async function deleteSnack(id: string) {
    const confirmDelete = confirm("Are you sure you want to delete this snack?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("snacks").delete().eq("id", id);
    if (error) { console.error(error); alert("Could not delete snack"); return; }
    setSnacks((prev) => prev.filter((snack) => snack.id !== id));
  }

  if (!authed) {
    return (
      <main style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#111", padding: "40px", borderRadius: "16px", border: "1px solid #333", width: "100%", maxWidth: "360px" }}>
          <h1 style={{ color: "white", marginBottom: "24px", fontSize: "24px", fontWeight: "900" }}>Admin</h1>
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ ...inputStyle, marginBottom: "12px" }}
          />
          {passwordError && (
            <p style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px" }}>Wrong password</p>
          )}
          <button onClick={handleLogin} style={{ ...buttonStyle, width: "100%", background: "#c96f7b" }}>
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px", color: "white" }}>
      <h1>Admin Panel</h1>

      <h2 style={{ marginTop: "40px", marginBottom: "20px" }}>
        Pending Images ({pendingImages.length})
      </h2>

      {pendingImages.length === 0 && (
        <p style={{ color: "#666" }}>No pending images.</p>
      )}

      <div style={{ display: "grid", gap: "20px" }}>
        {pendingImages.map((snack) => (
          <div
            key={snack.id}
            style={{
              border: "1px solid #333", borderRadius: "12px", padding: "20px",
              background: "#111", maxWidth: "600px", display: "flex", gap: "20px", alignItems: "center",
            }}
          >
            <img
              src={snack.pending_image_url}
              alt={snack.name}
              style={{ width: "120px", height: "120px", objectFit: "contain", borderRadius: "10px", background: "#000" }}
            />
            <div>
              <p style={{ fontWeight: "bold", marginBottom: "8px" }}>{snack.name}</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => approveImage(snack)} style={{ ...buttonStyle, background: "#22c55e" }}>Approve</button>
                <button onClick={() => rejectImage(snack)} style={{ ...buttonStyle, background: "#ef4444" }}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "40px", marginBottom: "20px" }}>
        Pending Snacks ({snacks.length})
      </h2>

      {snacks.length === 0 && (
        <p style={{ color: "#666" }}>No snacks waiting for approval.</p>
      )}

      <div style={{ display: "grid", gap: "20px" }}>
        {snacks.map((snack) => (
          <div
            key={snack.id}
            style={{ border: "1px solid #333", borderRadius: "12px", padding: "20px", background: "#111", maxWidth: "600px" }}
          >
            {snack.image_url && (
              <img
                src={snack.image_url}
                alt={snack.name}
                style={{ width: "160px", height: "160px", objectFit: "cover", borderRadius: "10px", marginBottom: "15px" }}
              />
            )}

            <label>Name</label>
            <input
              value={snack.name || ""}
              onChange={(e) => updateLocalSnack(snack.id, "name", e.target.value)}
              style={inputStyle}
            />

            <label>Description</label>
            <textarea
              value={snack.description || ""}
              onChange={(e) => updateLocalSnack(snack.id, "description", e.target.value)}
              style={{ ...inputStyle, minHeight: "90px" }}
            />

            <label>Category</label>
            <select
              value={snack.category || ""}
              onChange={(e) => updateLocalSnack(snack.id, "category", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <label>Image URL</label>
            <input
              value={snack.image_url || ""}
              onChange={(e) => updateLocalSnack(snack.id, "image_url", e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button onClick={() => saveSnack(snack)} style={buttonStyle}>Save</button>
              <button onClick={() => approveSnack(snack.id)} style={{ ...buttonStyle, background: "#22c55e" }}>Approve</button>
              <button onClick={() => deleteSnack(snack.id)} style={{ ...buttonStyle, background: "#ef4444" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const inputStyle = {
  display: "block", width: "100%", marginTop: "6px", marginBottom: "15px",
  padding: "10px", borderRadius: "8px", border: "1px solid #333", background: "#000", color: "white",
};

const buttonStyle = {
  padding: "10px 16px", borderRadius: "8px", border: "none",
  cursor: "pointer", background: "#3b82f6", color: "black", fontWeight: "bold",
};