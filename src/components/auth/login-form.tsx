"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(login, null);

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div className="space-y-2">
        <Label htmlFor="email">Имэйл хаяг</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Нууц үг</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <SubmitButton className="w-full">Нэвтрэх</SubmitButton>
    </form>
  );
}
