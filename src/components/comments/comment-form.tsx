"use client";

import { useActionState, useRef, useEffect } from "react";
import { addComment, type CommentTarget } from "@/actions/comments";
import type { FormState } from "@/actions/auth";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function CommentForm({ target }: { target: CommentTarget }) {
  const [state, action] = useActionState<FormState, FormData>(
    addComment.bind(null, target),
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Амжилттай нэмэгдсэн үед (алдаагүй null буцдаг) форм цэвэрлэнэ
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <FormMessage state={state} />
      <Textarea name="body" rows={3} placeholder="Сэтгэгдлээ бичнэ үү…" required maxLength={1000} />
      <SubmitButton variant="secondary">Сэтгэгдэл нэмэх</SubmitButton>
    </form>
  );
}
