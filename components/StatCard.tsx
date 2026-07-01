export default function StatCard({
  label,
  value,
  path,
  tone = "default",
}: {
  label: string;
  value: string | number;
  path: string;
  tone?: "default" | "good" | "bad";
}) {
  const toneClass = tone === "good" ? "text-moss" : tone === "bad" ? "text-red-400" : "text-paper";
  return (
    <div className="border border-line rounded bg-surface p-4 flex flex-col gap-2">
      <p className="font-mono text-[10px] text-paper/40 truncate">{path}</p>
      <p className={`text-2xl font-mono ${toneClass}`}>{value}</p>
      <p className="font-mono text-[11px] uppercase tracking-wider text-paper/50">{label}</p>
    </div>
  );
}
