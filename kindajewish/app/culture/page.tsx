import type { Metadata } from "next";
import Kicker from "@/components/Kicker";
import ContentCard from "@/components/ContentCard";
import PhotoCreditsList from "@/components/PhotoCreditsList";
import { culture } from "@/lib/culture";

export const metadata: Metadata = {
  title: "Culture — Kinda Jewish",
  description:
    "Food, jokes, shows, books — the stuff that's actually fun. Curated from Hey Alma, Tablet, Kveller, The Nosher, and JTA.",
};

export default function CulturePage() {
  return (
    <div className="mx-auto max-w-[1160px] px-5 md:px-6 pt-14 pb-[72px]">
      <Kicker accent="coral">Culture</Kicker>
      <h1 className="font-display text-[clamp(32px,5vw,50px)] font-bold leading-[1.05] tracking-[-0.02em] mb-3.5 text-text">
        Food, jokes, shows, books.
      </h1>
      <p className="text-[17px] text-text-muted max-w-[620px] mb-9 leading-[1.55]">
        The stuff that&apos;s actually fun. All of it lives elsewhere — we
        just point you there.
      </p>

      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {culture.map((item) => (
          <ContentCard key={item.title} item={item} />
        ))}
      </div>

      <PhotoCreditsList images={culture.map((item) => item.image)} />
    </div>
  );
}
