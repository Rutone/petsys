"use client";

import { useActionState } from "react";
import { editPetition } from "@/actions/petitions";
import type { FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function PetitionEditForm({
  petitionId,
  title,
  description,
}: {
  petitionId: string;
  title: string;
  description: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(
    editPetition.bind(null, petitionId),
    null
  );
  return (
    <form action={action} className="space-y-3">
      <FormMessage state={state} />
      <div className="space-y-2">
        <Label htmlFor="edit-title">Гарчиг</Label>
        <Input id="edit-title" name="title" defaultValue={title} required minLength={5} maxLength={150} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-desc">Тайлбар</Label>
        <Textarea id="edit-desc" name="description" rows={6} defaultValue={description} required minLength={20} maxLength={5000} />
      </div>
      <SubmitButton>Засаад дахин илгээх</SubmitButton>
    </form>
  );
}
