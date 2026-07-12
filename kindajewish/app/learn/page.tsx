import type { Metadata } from "next";
import Kicker from "@/components/Kicker";
import LinkCard from "@/components/LinkCard";
import { learnLinks } from "@/lib/stubLinks";

export const metadata: Metadata = {
  title: "Learn — Kinda Jewish",
  description: "Real questions, no textbook. Jewish literacy for people starting from wherever they are.",
};

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-[780px] px-5 md:px-6 pt-14 pb-[72px]">
      <Kicker accent="green">Learn</Kicker>
      <h1 className="font-display text-[clamp(32px,5vw,50px)] font-bold leading-[1.05] tracking-[-0.02em] mb-3.5 text-text">
        Real questions, no textbook.
      </h1>
      <p className="text-[17px] text-text-muted mb-2 leading-[1.55]">
        Full library still being built. For now, here&apos;s where the good
        stuff already lives:
      </p>
      <div className="text-sm text-text-faint mb-9">
        Coming soon: browse by question, not by category.
      </div>

      <div className="flex flex-col gap-3.5">
        {learnLinks.map((l) => (
          <LinkCard key={l.title} title={l.title} desc={l.desc} url={l.url} source={l.source} accent="green" />
        ))}
      </div>
    </div>
  );
}
