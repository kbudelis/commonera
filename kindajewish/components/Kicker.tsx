type Props = {
  children: React.ReactNode;
  accent?: "indigo" | "coral" | "green" | "teal" | "pink";
};

const BG: Record<string, string> = {
  indigo: "bg-indigo",
  coral: "bg-coral",
  green: "bg-green",
  teal: "bg-teal",
  pink: "bg-pink",
};

export default function Kicker({ children, accent = "indigo" }: Props) {
  return (
    <div
      className={`inline-block font-display font-bold text-[13px] text-ink px-4 py-2 rounded-full mb-5 ${BG[accent]}`}
    >
      {children}
    </div>
  );
}
