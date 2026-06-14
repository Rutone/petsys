"use client";

import { useActionState } from "react";
import { changePassword, type FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function PasswordChangeForm() {
  const [state, action] = useActionState<FormState, FormData>(changePassword, null);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div className="space-y-2">
        <Label htmlFor="current">Одоогийн нууц үг</Label>
        <Input id="current" name="current" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Шинэ нууц үг</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passwordConfirm">Шинэ нууц үг давтах</Label>
        <Input id="passwordConfirm" name="passwordConfirm" type="password" required />
      </div>
      <SubmitButton variant="secondary">Нууц үг солих</SubmitButton>
    </form>
  );
}
