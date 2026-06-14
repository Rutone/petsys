"use client";

import { useActionState } from "react";
import { createPetition } from "@/actions/petitions";
import type { FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { AUDIENCE_LABELS, USER_TYPES } from "@/lib/labels";

export function NewPetitionForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [state, action] = useActionState<FormState, FormData>(createPetition, null);

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />

      <div className="space-y-2">
        <Label htmlFor="title">Гарчиг</Label>
        <Input id="title" name="title" placeholder="Жишээ: Номын сангийн ажиллах цагийг сунгах" required minLength={5} maxLength={150} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Ангилал</Label>
          <select
            id="categoryId"
            name="categoryId"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">— Сонгох —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Дэлгэрэнгүй тайлбар</Label>
        <Textarea id="description" name="description" rows={8} placeholder="Асуудлаа тодорхой бичиж, ямар өөрчлөлт хүсэж байгаагаа тайлбарлана уу…" required minLength={20} maxLength={5000} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="files">Хавсралт (зураг/PDF, ≤5MB, хамгийн ихдээ 3)</Label>
        <Input id="files" name="files" type="file" multiple accept="image/*,application/pdf" />
      </div>

      <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
        ℹ️ Шаардагдах гарын үсгийн тоо болон хаагдах хугацааг <strong>модератор/админ зөвшөөрөхдөө тогтооно</strong>.
        Өргөдөл зөвшөөрөгдсөний дараа нийтэд харагдаж, гарын үсэг цуглуулж эхэлнэ.
      </p>
      <SubmitButton>Өргөдөл илгээх</SubmitButton>
    </form>
  );
}
