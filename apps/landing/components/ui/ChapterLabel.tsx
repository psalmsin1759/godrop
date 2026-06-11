type ChapterLabelProps = {
  index: string;
  title: string;
  tone?: "light" | "dark";
  className?: string;
};

/** Editorial chapter marker — "01 / The promise" */
export default function ChapterLabel({
  index,
  title,
  tone = "light",
  className = "",
}: ChapterLabelProps) {
  const color = tone === "light" ? "text-white/50" : "text-ink/50";
  const rule = tone === "light" ? "bg-white/20" : "bg-ink/20";
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className={`mono-label ${color}`}>
        {index} <span className="mx-1">/</span> {title}
      </span>
      <span className={`h-px flex-1 max-w-24 ${rule}`} />
    </div>
  );
}
