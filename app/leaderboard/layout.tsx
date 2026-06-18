import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard — Snackscore",
  description: "See the highest rated snacks on Snackscore. Top 10 overall, top per category, and Hall of Fame.",
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}