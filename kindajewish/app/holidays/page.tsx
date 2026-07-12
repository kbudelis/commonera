import Link from "next/link";
import type { Metadata } from "next";
import Kicker from "@/components/Kicker";
import Photo from "@/components/Photo";
import PhotoCreditsList from "@/components/PhotoCreditsList";
import { holidays } from "@/lib/holidays";
import { getLiveHolidayDates } from "@/lib/hebcal";

export const metadata: Metadata = {
  title: "Holidays — Kinda Jewish",
  description:
    "A calendar that doesn't assume you keep it. What each holiday is, why it might matter, and one easy way to mark it.",
};

export default async function HolidaysPage() {
  const live = await getLiveHolidayDates();
  return (
    <div className="mx-auto max-w-[1160px] px-5 md:px-6 pt-14 pb-[72px]">
      <Kicker accent="indigo">Holidays</Kicker>
      <h1 className="font-display text-[clamp(32px,5vw,50px)] font-bold leading-[1.05] tracking-[-0.02em] mb-3.5 text-text">
        A calendar that doesn&apos;t assume you keep it.
      </h1>
      <p className="text-[17px] text-text-muted max-w-[620px] mb-9 leading-[1.55]">
        What it is, why it might matter even if you don&apos;t believe in the
        theology, and one easy way to mark it.
      </p>

      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {holidays.map((h) => (
          <Link
            key={h.slug}
            href={`/holidays/${h.slug}`}
            className="flex flex-col gap-2 bg-surface border border-line rounded-[20px] p-[22px] no-underline hover:border-indigo transition-colors focus-ring"
          >
            <Photo
              src={h.image}
              alt=""
              accent="indigo"
              aspect="16/8"
              radius="12px"
              className="mb-1.5"
              sizes="(min-width: 768px) 30vw, 90vw"
            />
            <div className="font-display text-xl font-bold text-text">{h.name}</div>
            <div className="text-[13px] text-text-faint">
              {live[h.slug]?.dates ?? h.dates}
            </div>
          </Link>
        ))}
      </div>

      <PhotoCreditsList images={holidays.map((h) => h.image)} />
    </div>
  );
}
