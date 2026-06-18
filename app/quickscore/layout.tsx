import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quickscore — Snackscore",
  description: "Rate snacks one by one with Quickscore. The fastest way to score your way through hundreds of snacks.",
};

export default function QuickscoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}