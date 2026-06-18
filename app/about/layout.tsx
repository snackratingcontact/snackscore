import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Snackscore",
  description: "Learn about Snackscore, the community-driven platform for rating and discovering snacks from around the world.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}