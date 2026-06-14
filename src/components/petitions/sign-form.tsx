"use client";

import { useActionState } from "react";
import { signPetition, unsignPetition } from "@/actions/petitions";
import type { FormState } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function SignForm({ petitionId, signed }: { petitionId: string; signed: boolean }) {
  const [signState, signAction] = useActionState<FormState, FormData>(
    signPetition.bind(null, petitionId),
    null
  );
  const [unsignState, unsignAction] = useActionState<FormState, FormData>(
    unsignPetition.bind(null, petitionId),
    null
  );

  if (signed) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          ✓ Та энэ өргөдөлд гарын үсэг зурсан
        </p>
        <FormMessage state={unsignState} />
        <form action={unsignAction}>
          <SubmitButton variant="outline">Гарын үсгээ буцаах</SubmitButton>
        </form>
      </div>
    );
  }

  return (
    <form action={signAction} className="space-y-3">
      <FormMessage state={signState} />
      {!signState?.success && (
        <SubmitButton className="w-full sm:w-auto">✍️ Гарын үсэг зурах</SubmitButton>
      )}
    </form>
  );
}
