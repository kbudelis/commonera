import Link from "next/link";
import { getHoliday, getUpcomingHoliday, holidays } from "@/lib/holidays";
import { getLiveHolidayDates, pickUpcoming } from "@/lib/hebcal";
import { culture } from "@/lib/culture";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";

export default async function Home() {
  const live = pickUpcoming(await getLiveHolidayDates());
  const upcoming = live
    ? { ...getHoliday(live.slug)!, dates: live.dates }
    : getUpcomingHoliday();

  const featured: ContentCardItem[] = holidays.slice(0, 3).map((h) => ({
    title: `${h.name}: ${h.whatItIs.split(".")[0]}.`,
    source: "Kinda Jewish",
    url: `/holidays/${h.slug}`,
    kind: "Guide",
    image: h.image,
  }));

  const cultureHome = culture.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-[1160px] px-5 md:px-6 pt-[72px] pb-12">
        <h1 className="font-display text-[clamp(38px,6.4vw,68px)] leading-[1.04] font-bold tracking-[-0.02em] mb-5 max-w-[780px] text-text">
          Kinda Jewish,
          <br />
          <span className="text-indigo-text">fully welcome.</span>
        </h1>
        <p className="font-display text-xl md:text-2xl font-bold text-text mb-5 max-w-[560px]">
          No Hebrew or Jewish guilt required.
        </p>
        <p className="text-lg leading-[1.6] text-text-muted max-w-[560px] m-0">
          Maybe you had a bar mitzvah and haven&apos;t thought about it since.
          Maybe you married in, married out, or never really knew where you
          fit. This is a low-pressure way to poke around — no assumptions
          attached.
        </p>
      </section>

      {/* Four entry points */}
      <section className="mx-auto max-w-[1160px] px-5 md:px-6 pt-2 pb-16">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <Link
            href={`/holidays/${upcoming.slug}`}
            className="flex flex-col gap-2.5 bg-indigo hover:bg-indigo-hover text-ink rounded-[22px] p-[26px] min-h-[176px] no-underline transition-colors focus-ring"
          >
            <div className="text-xs font-bold uppercase tracking-[0.07em] opacity-75">
              What&apos;s coming up
            </div>
            <div className="font-display text-[23px] font-bold leading-[1.15]">{upcoming.name}</div>
            <div className="text-sm opacity-80">{upcoming.dates}</div>
            <div className="mt-auto text-sm font-bold">See the guide →</div>
          </Link>

          <Link
            href="/learn"
            className="flex flex-col gap-2.5 bg-surface border border-line hover:border-coral rounded-[22px] p-[26px] min-h-[176px] no-underline transition-colors focus-ring"
          >
            <div className="text-xs font-bold uppercase tracking-[0.07em] text-coral-text">
              Learn something
            </div>
            <div className="font-display text-[21px] font-bold leading-[1.2] text-text">
              &quot;What actually happens at a Shabbat dinner?&quot;
            </div>
            <div className="mt-auto text-sm font-bold text-text-muted">Answers, no textbook →</div>
          </Link>

          <Link
            href="/community"
            className="flex flex-col gap-2.5 bg-surface border border-line hover:border-teal rounded-[22px] p-[26px] min-h-[176px] no-underline transition-colors focus-ring"
          >
            <div className="text-xs font-bold uppercase tracking-[0.07em] text-teal-text">
              Meet people
            </div>
            <div className="font-display text-[21px] font-bold leading-[1.2] text-text">
              Free Shabbat dinners, near you
            </div>
            <div className="mt-auto text-sm font-bold text-text-muted">Find one →</div>
          </Link>

          <Link
            href="/ask"
            className="flex flex-col gap-2.5 bg-surface border border-line hover:border-pink rounded-[22px] p-[26px] min-h-[176px] no-underline transition-colors focus-ring"
          >
            <div className="text-xs font-bold uppercase tracking-[0.07em] text-pink-text">
              Just curious?
            </div>
            <div className="font-display text-[21px] font-bold leading-[1.2] text-text">
              Questions people actually ask
            </div>
            <div className="mt-auto text-sm font-bold text-text-muted">Browse the FAQ →</div>
          </Link>
        </div>
      </section>

      {/* Featured strip */}
      <section className="border-y border-line py-14 px-5 md:px-6">
        <div className="mx-auto max-w-[1160px]">
          <h2 className="font-display text-[26px] font-bold tracking-[-0.01em] mb-6 text-text">
            From around the site
          </h2>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {featured.map((item) => (
              <ContentCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Culture strip */}
      <section className="mx-auto max-w-[1160px] px-5 md:px-6 py-14">
        <h2 className="font-display text-[26px] font-bold tracking-[-0.01em] mb-6 text-text">
          Culture, unfiltered
        </h2>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {cultureHome.map((item) => (
            <ContentCard key={item.title} item={item} />
          ))}
        </div>
        <Link
          href="/culture"
          className="mt-6 inline-block font-display font-bold text-indigo-text no-underline hover:underline"
        >
          See all of Culture →
        </Link>
      </section>
    </div>
  );
}
