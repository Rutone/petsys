"use client";

import { useActionState } from "react";
import { resetPassword, type FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPassword, null);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="password">Шинэ нууц үг</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passwordConfirm">Шинэ нууц үг давтах</Label>
        <Input id="passwordConfirm" name="passwordConfirm" type="password" required />
      </div>
      <SubmitButton className="w-full">Нууц үг шинэчлэх</SubmitButton>
    </form>
  );
}
