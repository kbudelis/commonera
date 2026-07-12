import type { Metadata } from "next";
import Kicker from "@/components/Kicker";
import LinkCard from "@/components/LinkCard";
import { communityLinks } from "@/lib/stubLinks";

export const metadata: Metadata = {
  title: "Community — Kinda Jewish",
  description: "Show up, in person. Real, free ways to meet other Jewish people, no membership required.",
};

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-[780px] px-5 md:px-6 pt-14 pb-[72px]">
      <Kicker accent="teal">Community</Kicker>
      <h1 className="font-display text-[clamp(32px,5vw,50px)] font-bold leading-[1.05] tracking-[-0.02em] mb-3.5 text-text">
        Show up, in person.
      </h1>
      <p className="text-[17px] text-text-muted mb-9 leading-[1.55] max-w-[620px]">
        Full directory (with location-aware matching) is coming. These groups
        already do the actual work of getting people in a room together:
      </p>

      <div className="flex flex-col gap-3.5">
        <div>
          <LinkCard
            title={communityLinks[0].title}
            desc={communityLinks[0].desc}
            url={communityLinks[0].url}
            accent="teal"
          />
          <p className="mt-2.5 px-1 text-sm text-text-faint leading-relaxed max-w-[620px]">
            New to Shabbat dinners? Expect candles, a blessing over wine and
            bread, and a meal that runs long on purpose — no Hebrew or prior
            experience required. Most hosts walk you through the whole thing.
          </p>
        </div>
        {communityLinks.slice(1).map((l) => (
          <LinkCard key={l.title} title={l.title} desc={l.desc} url={l.url} accent="teal" />
        ))}
      </div>
    </div>
  );
}
