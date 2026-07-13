import { photoCredits } from "@/lib/photoCredits";

export default function PhotoCreditsList({ images }: { images: string[] }) {
  const unique = Array.from(new Set(images)).filter((src) => photoCredits[src]);
  if (unique.length === 0) return null;

  return (
    <div className="mt-16 pt-6 border-t border-line">
      <p className="text-[11px] uppercase tracking-[0.06em] text-text-faint mb-2">
        Photo credits
      </p>
      <p className="text-[13px] text-text-faint leading-relaxed">
        {unique.map((src, i) => {
          const c = photoCredits[src];
          return (
            <span key={src}>
              <a
                href={c.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-text-muted underline decoration-line-strong"
              >
                {c.artist}
              </a>{" "}
              ({c.license}, Wikimedia Commons)
              {i < unique.length - 1 ? " · " : ""}
            </span>
          );
        })}
      </p>
    </div>
  );
}
