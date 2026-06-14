"use client";

import { useActionState } from "react";
import { verifyEmail, resendCode, type FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function VerifyForm({ email }: { email: string }) {
  const [state, action] = useActionState<FormState, FormData>(verifyEmail, null);
  const [resendState, resendAction] = useActionState<FormState, FormData>(resendCode, null);

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        <FormMessage state={state} />
        <div className="space-y-2">
          <Label htmlFor="email">Имэйл хаяг</Label>
          <Input id="email" name="email" type="email" defaultValue={email} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Баталгаажуулах код (6 оронтой)</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            required
          />
        </div>
        <SubmitButton className="w-full">Баталгаажуулах</SubmitButton>
      </form>

      <form action={resendAction} className="space-y-2 border-t pt-4">
        <FormMessage state={resendState} />
        <input type="hidden" name="email" value={email} />
        <SubmitButton variant="outline" className="w-full">
          Кодыг дахин илгээх
        </SubmitButton>
      </form>
    </div>
  );
}
