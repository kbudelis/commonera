type Props = {
  title: string;
  desc: string;
  url: string;
  source?: string;
  accent?: "indigo" | "coral" | "green" | "teal" | "pink";
};

const BORDER: Record<string, string> = {
  indigo: "hover:border-indigo",
  coral: "hover:border-coral",
  green: "hover:border-green",
  teal: "hover:border-teal",
  pink: "hover:border-pink",
};

const ACCENT_VAR: Record<string, string> = {
  indigo: "var(--indigo)",
  coral: "var(--coral)",
  green: "var(--green)",
  teal: "var(--teal)",
  pink: "var(--pink)",
};

export default function LinkCard({ title, desc, url, source, accent = "indigo" }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className={`block rounded-2xl border border-line px-5 py-[18px] no-underline transition-colors focus-ring ${BORDER[accent]}`}
      style={{ borderLeftWidth: "3px", borderLeftColor: ACCENT_VAR[accent] }}
    >
      <div className="text-[16px] font-semibold text-text mb-1">{title}</div>
      <div className="text-[13px] text-text-faint">
        {source ? <>via {source} &middot; </> : null}
        {desc}
      </div>
    </a>
  );
}
