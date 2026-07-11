import type { Metadata } from "next";
import "./globals.css";
import "@/styles/cinematic.css";

export const metadata: Metadata = {
  title: "Relyo · Shopping agent demo",
  description: "A deterministic Team MMM shopping-agent prototype.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
