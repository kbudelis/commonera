import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Photo from "@/components/Photo";
import { getHoliday, holidays } from "@/lib/holidays";
import { getLiveHolidayDates } from "@/lib/hebcal";

export function generateStaticParams() {
  return holidays.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const holiday = getHoliday(slug);
  if (!holiday) return {};
  return {
    title: `${holiday.name} — Kinda Jewish`,
    description: holiday.whatItIs,
  };
}

export default async function HolidayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const holiday = getHoliday(slug);
  if (!holiday) notFound();

  const live = await getLiveHolidayDates();
  const dates = live[holiday.slug]?.dates ?? holiday.dates;

  return (
    <article className="mx-auto max-w-[780px] px-5 md:px-6 pt-14 pb-[72px]">
      <Link
        href="/holidays"
        className="block w-fit text-sm font-semibold text-text-muted hover:text-text mb-5 no-underline"
      >
        ← All holidays
      </Link>

      <div className="inline-block bg-indigo text-ink font-display font-bold text-[13px] px-3.5 py-[7px] rounded-full mb-4">
        {dates}
      </div>
      <h1 className="font-display text-[clamp(34px,5.5vw,54px)] font-bold leading-[1.05] tracking-[-0.02em] mb-7 text-text">
        {holiday.name}
      </h1>

      <Photo
        src={holiday.image}
        alt={`${holiday.name} — editorial photo`}
        accent="indigo"
        aspect="16/7"
        radius="20px"
        className="mb-9"
        sizes="(min-width: 768px) 780px, 100vw"
        showCredit
      />

      <div className="mb-9">
        <div className="text-[13px] font-bold font-display uppercase tracking-[0.07em] text-indigo-text mb-2.5">
          What it is
        </div>
        <p className="text-[19px] leading-[1.6] text-text/95 m-0">{holiday.whatItIs}</p>
      </div>

      <div className="mb-9">
        <div className="text-[13px] font-bold font-display uppercase tracking-[0.07em] text-indigo-text mb-2.5">
          Why it might matter, even if you&apos;re not sure about God
        </div>
        <p className="text-[17px] leading-[1.6] text-text-muted m-0">{holiday.whyItMatters}</p>
      </div>

      <div className="bg-surface border border-line rounded-[20px] p-[26px] mb-7">
        <div className="text-[13px] font-bold font-display uppercase tracking-[0.07em] text-indigo-text mb-2.5">
          One easy way to mark it
        </div>
        <p className="text-[17px] leading-[1.6] m-0 text-text/95">{holiday.tonight}</p>
      </div>

      <a
        href={holiday.recipeUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center gap-4 border border-line rounded-[18px] p-4 no-underline hover:border-indigo transition-colors focus-ring"
      >
        <Photo
          src={holiday.image}
          alt=""
          accent="indigo"
          aspect="1/1"
          radius="10px"
          className="w-16 h-16 shrink-0"
          sizes="64px"
        />
        <div>
          <div className="text-xs text-text-faint mb-0.5">
            Recipe &middot; via {holiday.recipeSource}
          </div>
          <div className="text-[16px] font-semibold text-text">{holiday.recipeName}</div>
        </div>
      </a>

      {holiday.utilityLink && (
        <a
          href={holiday.utilityLink.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3.5 flex items-center gap-4 border border-line rounded-[18px] p-4 no-underline hover:border-indigo transition-colors focus-ring"
        >
          <div
            className="w-16 h-16 shrink-0 rounded-[10px] bg-indigo/15 flex items-center justify-center font-display text-2xl"
            aria-hidden="true"
          >
            🕯️
          </div>
          <div>
            <div className="text-xs text-text-faint mb-0.5">{holiday.utilityLink.desc}</div>
            <div className="text-[16px] font-semibold text-text">
              {holiday.utilityLink.label}
            </div>
          </div>
        </a>
      )}
    </article>
  );
}
