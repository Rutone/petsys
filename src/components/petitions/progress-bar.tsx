export function ProgressBar({ value, goal }: { value: number; goal: number }) {
  const percent = Math.min(100, Math.round((value / Math.max(goal, 1)) * 100));
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{value}</span> / {goal} гарын үсэг ({percent}%)
      </p>
    </div>
  );
}
