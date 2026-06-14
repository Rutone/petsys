import { STATUS_LABELS } from "@/lib/labels";

const styles: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  APPROVED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-red-500/15 text-red-700 dark:text-red-400",
  DISCUSSING: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  IN_PROGRESS: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  RESOLVED: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  CLOSED: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
