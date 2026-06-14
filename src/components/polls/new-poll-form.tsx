"use client";

import { useActionState, useState } from "react";
import { createPoll } from "@/actions/polls";
import type { FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { AUDIENCE_LABELS, USER_TYPES } from "@/lib/labels";

export function NewPollForm() {
  const [state, action] = useActionState<FormState, FormData>(createPoll, null);
  const [optionCount, setOptionCount] = useState(2);

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div className="space-y-2">
        <Label htmlFor="question">Асуулт</Label>
        <Input
          id="question"
          name="question"
          placeholder="Жишээ: Хичээлийн шинэ байрны цайны газар юу нэмэх вэ?"
          required
          minLength={5}
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Тайлбар (заавал биш)</Label>
        <Textarea id="description" name="description" rows={4} maxLength={2000} />
      </div>

      <div className="space-y-2">
        <Label>Сонголтууд (2–8)</Label>
        {Array.from({ length: optionCount }).map((_, i) => (
          <Input key={i} name="options" placeholder={`Сонголт ${i + 1}`} maxLength={100} required={i < 2} />
        ))}
        <div className="flex gap-2">
          {optionCount < 8 && (
            <Button type="button" variant="outline" size="sm" onClick={() => setOptionCount((c) => c + 1)}>
              + Сонголт нэмэх
            </Button>
          )}
          {optionCount > 2 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setOptionCount((c) => c - 1)}>
              − Сүүлийнхийг хасах
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="audience">Хэнд харагдах</Label>
          <select
            id="audience"
            name="audience"
            defaultValue="ALL"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="ALL">{AUDIENCE_LABELS.ALL}</option>
            {USER_TYPES.map((t) => (
              <option key={t} value={t}>
                {AUDIENCE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">Дуусах огноо (заавал биш)</Label>
          <Input id="endsAt" name="endsAt" type="date" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Санал асуулга админ зөвшөөрсний дараа нийтэд харагдана.
      </p>
      <SubmitButton>Санал асуулга үүсгэх</SubmitButton>
    </form>
  );
}
