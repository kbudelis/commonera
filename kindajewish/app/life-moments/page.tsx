import type { Metadata } from "next";
import Link from "next/link";
import Kicker from "@/components/Kicker";
import LinkCard from "@/components/LinkCard";
import { lifeLinks } from "@/lib/stubLinks";

export const metadata: Metadata = {
  title: "Life Moments — Kinda Jewish",
  description: "No rabbi on speed dial? No problem. Judgment-free guides for the big moments.",
};

export default function LifeMomentsPage() {
  return (
    <div className="mx-auto max-w-[780px] px-5 md:px-6 pt-14 pb-[72px]">
      <Kicker accent="pink">Life Moments</Kicker>
      <h1 className="font-display text-[clamp(32px,5vw,50px)] font-bold leading-[1.05] tracking-[-0.02em] mb-3.5 text-text">
        No rabbi on speed dial? No problem.
      </h1>
      <p className="text-[17px] text-text-muted mb-9 leading-[1.55] max-w-[620px]">
        Judgment-free guides for namings, b&apos;nei mitzvah, weddings, and
        loss — especially for interfaith families figuring it out as they go.
        Full guides coming; these already help:
      </p>

      <div className="flex flex-col gap-3.5">
        {lifeLinks.map((l) => (
          <LinkCard key={l.title} title={l.title} desc={l.desc} url={l.url} source={l.source} accent="pink" />
        ))}
      </div>

      <div className="mt-10 rounded-[20px] bg-surface border border-line p-6">
        <p className="text-[15px] text-text-muted leading-relaxed m-0">
          Invited to a funeral, bris, or bar mitzvah and mostly just need to
          know what to wear and what to say?{" "}
          <Link href="/ask" className="text-pink-text font-semibold no-underline hover:underline">
            We answered exactly that →
          </Link>
        </p>
      </div>
    </div>
  );
}
