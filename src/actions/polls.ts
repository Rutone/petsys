"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireVerifiedUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { notifyModerators } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";
import { USER_TYPES } from "@/lib/labels";
import type { FormState } from "@/actions/auth";

const AUDIENCES = ["ALL", ...USER_TYPES] as const;

const pollSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "Асуулт хамгийн багадаа 5 тэмдэгт байна.")
    .max(200, "Асуулт хэт урт байна."),
  description: z.string().trim().max(2000, "Тайлбар хэт урт байна."),
  audience: z.enum(AUDIENCES).default("ALL"),
  endsAt: z.string().trim().optional(),
});

export async function createPoll(_prev: FormState, formData: FormData): Promise<FormState> {
  const guard = await requireVerifiedUser();
  if ("error" in guard) return { error: guard.error };

  const limited = await rateLimit("create-poll", 10, 60 * 60 * 1000);
  if (!limited.ok) return { error: limited.error };

  const parsed = pollSchema.safeParse({
    question: formData.get("question"),
    description: formData.get("description") ?? "",
    audience: formData.get("audience") || "ALL",
    endsAt: formData.get("endsAt") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Талбаруудаа шалгана уу." };
  }

  const options = Array.from(
    new Set(
      formData
        .getAll("options")
        .map((o) => String(o).trim())
        .filter(Boolean)
    )
  );
  if (options.length < 2) return { error: "Хамгийн багадаа 2 өөр сонголт оруулна уу." };
  if (options.length > 8) return { error: "Хамгийн ихдээ 8 сонголт оруулах боломжтой." };
  if (options.some((o) => o.length > 100)) return { error: "Сонголт хэт урт байна." };

  let endsAt: Date | null = null;
  if (parsed.data.endsAt) {
    endsAt = new Date(parsed.data.endsAt);
    if (Number.isNaN(endsAt.getTime())) return { error: "Дуусах огноо буруу байна." };
    if (endsAt <= new Date()) return { error: "Дуусах огноо ирээдүйд байх ёстой." };
  }

  const poll = await prisma.poll.create({
    data: {
      question: parsed.data.question,
      description: parsed.data.description,
      audience: parsed.data.audience,
      endsAt,
      authorId: guard.user.id,
      options: { create: options.map((text) => ({ text })) },
    },
  });

  await logAudit({
    actorId: guard.user.id,
    action: "CREATE_POLL",
    entityType: "POLL",
    entityId: poll.id,
    detail: poll.question,
  });
  await notifyModerators({
    type: "POLL_PENDING",
    title: "Шинэ санал асуулга зөвшөөрөл хүлээж байна",
    body: poll.question,
    link: `/polls/${poll.id}`,
  });

  revalidatePath("/polls");
  redirect(`/polls/${poll.id}`);
}

export async function votePoll(
  pollId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const guard = await requireVerifiedUser();
  if ("error" in guard) return { error: guard.error };

  const optionId = String(formData.get("optionId") ?? "");
  if (!optionId) return { error: "Сонголтоо хийнэ үү." };

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: { select: { id: true } } },
  });
  if (!poll) return { error: "Санал асуулга олдсонгүй." };
  if (poll.status !== "APPROVED") return { error: "Энэ санал асуулгад санал өгөх боломжгүй." };
  if (poll.endsAt && poll.endsAt <= new Date())
    return { error: "Санал асуулгын хугацаа дууссан байна." };
  if (!poll.options.some((o) => o.id === optionId)) return { error: "Сонголт буруу байна." };

  try {
    await prisma.vote.create({
      data: { pollId, optionId, userId: guard.user.id },
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return { error: "Та энэ санал асуулгад аль хэдийн санал өгсөн байна." };
    }
    throw e;
  }

  await logAudit({
    actorId: guard.user.id,
    action: "VOTE",
    entityType: "POLL",
    entityId: pollId,
  });

  revalidatePath(`/polls/${pollId}`);
  revalidatePath("/polls");
  return { success: "Таны санал амжилттай бүртгэгдлээ." };
}
