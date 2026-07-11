import type { Metadata } from "next";
import "./globals.css";

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Passover for Beginners — Build a seder that feels like yours",
  description:
    "Create a warm, personalized, printable Haggadah in minutes — no prior seder-leading experience required.",
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
