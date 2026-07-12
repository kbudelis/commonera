import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1160px] px-5 md:px-6 py-10 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-display text-base font-bold text-text">
          kinda jewish
        </Link>
        <p className="text-[13px] text-text-faint">
          A curated guide for the kinda Jewish and the Jewish-curious.
        </p>
      </div>
    </footer>
  );
}
