import type { Metadata, Viewport } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"] });
const garamond = EB_Garamond({ variable: "--font-garamond", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hollow Knight — Descend into Hallownest",
  description:
    "A fan-made showcase of Hollow Knight, Team Cherry's hand-drawn action adventure through a vast ruined kingdom of insects and heroes.",
};

// Matches the scene background so mobile browser chrome blends in.
export const viewport: Viewport = { themeColor: "#0c1017", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${garamond.variable} dark h-full antialiased`}
    >
      <body className="min-h-full font-serif text-lg">{children}</body>
    </html>
  );
}
