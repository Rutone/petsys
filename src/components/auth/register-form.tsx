"use client";

import { useActionState, useState } from "react";
import { register, type FormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { USER_TYPES, USER_TYPE_LABELS, USER_TYPE_CODE_LABELS } from "@/lib/labels";

export function RegisterForm() {
  const [state, action] = useActionState<FormState, FormData>(register, null);
  const [userType, setUserType] = useState<string>("STUDENT");

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />

      <div className="space-y-2">
        <Label>Хэрэглэгчийн төрөл</Label>
        <div className="grid grid-cols-3 gap-2">
          {USER_TYPES.map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-lg border px-2 py-2 text-center text-sm transition-colors ${
                userType === t
                  ? "border-primary bg-primary/5 font-medium text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <input
                type="radio"
                name="userType"
                value={t}
                checked={userType === t}
                onChange={(e) => setUserType(e.target.value)}
                className="sr-only"
              />
              {USER_TYPE_LABELS[t]}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Бүтэн нэр</Label>
        <Input id="name" name="name" placeholder="Бат-Эрдэнэ Болд" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">{USER_TYPE_CODE_LABELS[userType]}</Label>
        <Input
          id="code"
          name="code"
          placeholder={userType === "STUDENT" ? "B210910045" : userType === "TEACHER" ? "T2024001" : "S2024001"}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Имэйл хаяг</Label>
        <Input id="email" name="email" type="email" placeholder="tanii.ner@must.edu.mn" required />
      </div>

      {userType === "STUDENT" && (
        <div className="space-y-2">
          <Label htmlFor="school">Сургууль (заавал биш)</Label>
          <Input id="school" name="school" placeholder="Мэдээлэл, холбооны технологийн сургууль" />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="department">Тэнхим / Алба (заавал биш)</Label>
        <Input id="department" name="department" placeholder="Компьютерийн ухааны тэнхим" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Нууц үг</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passwordConfirm">Нууц үг давтах</Label>
        <Input id="passwordConfirm" name="passwordConfirm" type="password" required />
      </div>

      <SubmitButton className="w-full">Бүртгүүлэх</SubmitButton>
    </form>
  );
}
