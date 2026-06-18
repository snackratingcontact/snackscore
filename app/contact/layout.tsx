import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Snackscore",
  description: "Get in touch with the Snackscore team. We'd love to hear your questions, suggestions, or feedback.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}