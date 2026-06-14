"use client";

import { useActionState } from "react";
import { updateProfile, type FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function ProfileEditForm({
  defaults,
}: {
  defaults: { name: string; school: string; department: string; avatarUrl: string };
}) {
  const [state, action] = useActionState<FormState, FormData>(updateProfile, null);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div className="space-y-2">
        <Label htmlFor="name">Бүтэн нэр</Label>
        <Input id="name" name="name" defaultValue={defaults.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="school">Сургууль</Label>
        <Input id="school" name="school" defaultValue={defaults.school} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Тэнхим / Алба</Label>
        <Input id="department" name="department" defaultValue={defaults.department} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Профайл зургийн URL</Label>
        <Input id="avatarUrl" name="avatarUrl" type="url" defaultValue={defaults.avatarUrl} placeholder="https://…" />
      </div>
      <SubmitButton>Хадгалах</SubmitButton>
    </form>
  );
}
