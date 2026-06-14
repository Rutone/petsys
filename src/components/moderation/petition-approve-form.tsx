"use client";

import { useActionState } from "react";
import { approvePetition } from "@/actions/admin";
import type { FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function PetitionApproveForm({ petitionId }: { petitionId: string }) {
  const [state, action] = useActionState<FormState, FormData>(
    approvePetition.bind(null, petitionId),
    null
  );
  return (
    <form action={action} className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-500/5 p-3">
      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Зөвшөөрөх</p>
      <FormMessage state={state} />
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor={`goal-${petitionId}`} className="text-xs">
            Шаардагдах гарын үсэг *
          </Label>
          <Input
            id={`goal-${petitionId}`}
            name="goal"
            type="number"
            min={5}
            max={100000}
            defaultValue={50}
            required
            className="w-32"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`closes-${petitionId}`} className="text-xs">
            Хаагдах огноо (заавал биш)
          </Label>
          <Input id={`closes-${petitionId}`} name="closesAt" type="date" className="w-44" />
        </div>
        <SubmitButton variant="default">Зөвшөөрөх</SubmitButton>
      </div>
    </form>
  );
}
