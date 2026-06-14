export function FormMessage({
  state,
}: {
  state: { error?: string; success?: string } | null;
}) {
  if (!state) return null;
  if (state.error)
    return (
      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {state.error}
      </p>
    );
  if (state.success)
    return (
      <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
        {state.success}
      </p>
    );
  return null;
}
