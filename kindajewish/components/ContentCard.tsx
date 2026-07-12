import Link from "next/link";
import Photo from "./Photo";

export type ContentCardItem = {
  title: string;
  source: string;
  url: string;
  kind: "Read" | "Watch" | "Listen" | "Guide";
  image: string;
};

const KIND_CLASS: Record<ContentCardItem["kind"], string> = {
  Read: "text-indigo-text",
  Guide: "text-indigo-text",
  Watch: "text-coral-text",
  Listen: "text-green-text",
};

const KIND_ACCENT: Record<ContentCardItem["kind"], "indigo" | "coral" | "green"> = {
  Read: "indigo",
  Guide: "indigo",
  Watch: "coral",
  Listen: "green",
};

export default function ContentCard({ item }: { item: ContentCardItem }) {
  const internal = item.url.startsWith("/");

  const inner = (
    <>
      <Photo
        src={item.image}
        alt=""
        accent={KIND_ACCENT[item.kind]}
        aspect="16/9"
        radius="0"
        sizes="(min-width: 768px) 33vw, 100vw"
      />
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className={`text-[11px] font-bold uppercase tracking-[0.06em] ${KIND_CLASS[item.kind]}`}>
          {item.kind}
        </div>
        <div className="font-display text-[17px] font-bold leading-snug text-text">
          {item.title}
        </div>
        <div className="mt-auto text-xs text-text-faint">via {item.source}</div>
      </div>
    </>
  );

  const className =
    "group flex flex-col h-full bg-surface border border-line rounded-[20px] overflow-hidden no-underline hover:border-indigo transition-colors focus-ring";

  if (internal) {
    return (
      <Link href={item.url} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <a href={item.url} target="_blank" rel="noreferrer noopener" className={className}>
      {inner}
    </a>
  );
}
