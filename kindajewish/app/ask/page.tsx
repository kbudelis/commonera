import type { Metadata } from "next";
import Kicker from "@/components/Kicker";
import FaqAccordion from "@/components/FaqAccordion";
import LinkCard from "@/components/LinkCard";
import AskForm from "@/components/AskForm";

export const metadata: Metadata = {
  title: "Ask — Kinda Jewish",
  description:
    "Common questions from people figuring this out, answered plainly — including what to wear, bring, and say at Jewish funerals, brises, and b'nei mitzvah.",
};

const FAQ_BASICS = [
  {
    q: "Do I have to believe in God for any of this to count?",
    a: "No. A huge amount of Jewish practice and culture works fine as ritual, memory, and community — belief is optional, not a prerequisite.",
  },
  {
    q: "I'm not Jewish but my partner is — can I be part of this?",
    a: "Yes, and this whole site assumes exactly that situation is common. Most of what's here works for partners, kids, and family of any background.",
  },
  {
    q: "Is it weird to get into this now, as an adult, starting from basically nothing?",
    a: "It's extremely normal. Most of the orgs linked here exist specifically because this is a common starting point, not a rare one.",
  },
  {
    q: "Do I need to keep kosher or go to synagogue to \"count\" as Jewish?",
    a: "No. Jewish identity has never been just one thing, and plenty of Jewish people do neither.",
  },
  {
    q: "What if my family wasn't religious at all — is there still something here for me?",
    a: "Most of this site is built around culture and community, not religious observance — that's the point.",
  },
];

const FAQ_SHOWING_UP = [
  {
    q: "What do I wear to a Jewish funeral?",
    a: "Dark-ish and conservative, same as most funerals — no need for a suit if you don't own one. If a basket of kippahs (small head coverings) is offered at the door, take one; that goes for everyone, Jewish or not. One heads-up: flowers usually aren't part of Jewish funerals, so skip the bouquet.",
  },
  {
    q: "What do I say when someone dies?",
    a: "\"May their memory be a blessing\" always works, and you'll hear it a lot. But honestly, \"I'm so sorry\" and just showing up count for more than getting the phrasing right. If you visit during shiva (the first week of mourning at the family's home), you don't need to say much at all — being there is the whole point.",
  },
  {
    q: "I got invited to a bris — what do I need to know?",
    a: "It's a morning ceremony welcoming a baby boy, held when he's eight days old, usually at home. Dress nice-casual, say \"mazel tov,\" and nobody expects you to watch the main event — most people are looking at the bagels. Yes, there will be bagels.",
  },
  {
    q: "What about a bar or bat mitzvah?",
    a: "Dress like a slightly-fancy wedding guest. The service can run a couple of hours and it's fine to slip in a little late. If you're bringing a gift, money in multiples of $18 is the classic move — 18 spells \"chai,\" the Hebrew word for life.",
  },
  {
    q: "What should I bring to a Shabbat dinner?",
    a: "Wine, flowers, or dessert are all safe. One caveat: if your hosts keep kosher, ask before bringing anything edible — it's a whole system, and they'll appreciate the question more than a surprise cheesecake. Showing up curious is the actual requirement.",
  },
  {
    q: "Do I wear a kippah if I'm not Jewish?",
    a: "If they're offered at the door — at a synagogue, funeral, or b'nei mitzvah — yes, take one. It's a sign of respect for the space, not a statement of faith, and no one will think you're converting.",
  },
];

export default function AskPage() {
  return (
    <div className="mx-auto max-w-[780px] px-5 md:px-6 pt-14 pb-[72px]">
      <Kicker accent="indigo">Ask</Kicker>
      <h1 className="font-display text-[clamp(32px,5vw,50px)] font-bold leading-[1.05] tracking-[-0.02em] mb-3.5 text-text">
        Common questions from people figuring this out.
      </h1>
      <p className="text-[17px] text-text-muted mb-9 leading-[1.55]">
        These come up constantly. Live Q&amp;A is coming soon — for now, got
        one we haven&apos;t covered? Ask below.
      </p>

      <h2 className="font-display text-xl font-bold text-text mb-4">The basics</h2>
      <FaqAccordion items={FAQ_BASICS} />

      <h2 className="font-display text-xl font-bold text-text mb-4">
        Going to a thing? What to wear, bring, and say
      </h2>
      <FaqAccordion items={FAQ_SHOWING_UP} />

      <h2 className="font-display text-xl font-bold text-text mb-2">
        Ask a real person, right now
      </h2>
      <p className="text-[15px] text-text-muted mb-4 leading-[1.5]">
        Until our live Q&amp;A arrives, these two already do it well — no
        synagogue membership, no judgment.
      </p>
      <div className="flex flex-col gap-3.5 mb-12">
        <LinkCard
          title="Ask the Rabbi (the Humanistic kind)"
          source="Society for Humanistic Judaism"
          desc="A real rabbi answers real questions — belief in God explicitly optional."
          url="https://shj.org/meaning-learning/what-is-humanistic-judaism/ask-the-rabbi/"
          accent="indigo"
        />
        <LinkCard
          title="A Bintel Brief"
          source="The Forward"
          desc="The Jewish advice column that's been fielding life's dilemmas since 1906."
          url="https://forward.com/tag/bintel-brief/"
          accent="indigo"
        />
      </div>

      <AskForm />
    </div>
  );
}
