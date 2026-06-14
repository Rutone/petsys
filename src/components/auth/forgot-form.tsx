"use client";

import { useActionState } from "react";
import { requestPasswordReset, type FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function ForgotForm() {
  const [state, action] = useActionState<FormState, FormData>(requestPasswordReset, null);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div className="space-y-2">
        <Label htmlFor="email">Имэйл хаяг</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <SubmitButton className="w-full">Сэргээх холбоос авах</SubmitButton>
    </form>
  );
}
