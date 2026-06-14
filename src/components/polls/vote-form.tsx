"use client";

import { useActionState } from "react";
import { votePoll } from "@/actions/polls";
import type { FormState } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function VoteForm({
  pollId,
  options,
}: {
  pollId: string;
  options: { id: string; text: string }[];
}) {
  const [state, action] = useActionState<FormState, FormData>(
    votePoll.bind(null, pollId),
    null
  );

  return (
    <form action={action} className="space-y-3">
      <FormMessage state={state} />
      <div className="space-y-2">
        {options.map((o) => (
          <label
            key={o.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5 hover:bg-muted/50"
          >
            <input type="radio" name="optionId" value={o.id} required className="accent-primary" />
            <span>{o.text}</span>
          </label>
        ))}
      </div>
      {!state?.success && <SubmitButton>Санал өгөх</SubmitButton>}
    </form>
  );
}
