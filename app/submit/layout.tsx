import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Snack — Snackscore",
  description: "Can't find your favourite snack on Snackscore? Submit it and help grow the community.",
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}