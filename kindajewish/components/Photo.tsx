import Image from "next/image";
import { photoCredits } from "@/lib/photoCredits";

type Accent = "indigo" | "coral" | "green" | "teal" | "pink";

const ACCENT_VAR: Record<Accent, string> = {
  indigo: "var(--indigo)",
  coral: "var(--coral)",
  green: "var(--green)",
  teal: "var(--teal)",
  pink: "var(--pink)",
};

type Props = {
  src: string;
  alt: string;
  accent?: Accent;
  aspect?: string;
  radius?: string;
  className?: string;
  sizes?: string;
  showCredit?: boolean;
};

export default function Photo({
  src,
  alt,
  accent = "indigo",
  aspect = "16/9",
  radius = "12px",
  className = "",
  sizes = "(min-width: 768px) 33vw, 100vw",
  showCredit = false,
}: Props) {
  const credit = photoCredits[src];

  return (
    <figure className={`m-0 ${className}`}>
      <div
        className="relative overflow-hidden bg-surface"
        style={{ aspectRatio: aspect, borderRadius: radius }}
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          style={{ filter: "grayscale(1) contrast(1.2) brightness(0.85)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: ACCENT_VAR[accent],
            mixBlendMode: "color",
            opacity: 0.65,
          }}
        />
      </div>
      {showCredit && credit && (
        <figcaption className="mt-1.5 text-[11px] text-text-faint">
          Photo:{" "}
          <a
            href={credit.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-text-muted underline decoration-line-strong"
          >
            {credit.artist}
          </a>
          , {credit.license}, via Wikimedia Commons
        </figcaption>
      )}
    </figure>
  );
}
