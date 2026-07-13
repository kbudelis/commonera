import type { Metadata } from "next";
import "@fontsource/atkinson-hyperlegible/latin-400.css";
import "@fontsource/atkinson-hyperlegible/latin-400-italic.css";
import "@fontsource/atkinson-hyperlegible/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-800.css";
import "@fontsource/source-serif-4/latin-400.css";
import "@fontsource/source-serif-4/latin-400-italic.css";
import "@fontsource/source-serif-4/latin-600.css";
import "./globals.css";

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL("https://letmypeoplehost.com"),
  title: "Let My People Host — Build a seder that feels like yours",
  description:
    "Create a warm, personalized, printable Haggadah in minutes — no prior seder-leading experience required.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Let My People Host — Build a seder that feels like yours",
    description:
      "Create a warm, personalized, printable Haggadah in minutes — no prior seder-leading experience required.",
    siteName: "Let My People Host",
    url: "/",
  },
  icons: {
    icon: `${publicBasePath}/covers/modernist.webp`,
    shortcut: `${publicBasePath}/covers/modernist.webp`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
