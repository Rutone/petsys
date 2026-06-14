"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser, requireVerifiedUser } from "@/lib/session";
import { PUBLIC_STATUSES } from "@/lib/labels";
import type { FormState } from "@/actions/auth";

export type CommentTarget = { petitionId?: string; pollId?: string };

const bodySchema = z
  .string()
  .trim()
  .min(1, "Сэтгэгдлээ бичнэ үү.")
  .max(1000, "Сэтгэгдэл хэт урт байна.");

export async function addComment(
  target: CommentTarget,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const guard = await requireVerifiedUser();
  if ("error" in guard) return { error: guard.error };

  const parsed = bodySchema.safeParse(formData.get("body"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Сэтгэгдлээ шалгана уу." };

  if (target.petitionId) {
    const petition = await prisma.petition.findUnique({ where: { id: target.petitionId } });
    if (!petition || !PUBLIC_STATUSES.includes(petition.status))
      return { error: "Энэ өргөдөлд сэтгэгдэл бичих боломжгүй." };
    await prisma.comment.create({
      data: { body: parsed.data, authorId: guard.user.id, petitionId: target.petitionId },
    });
    revalidatePath(`/petitions/${target.petitionId}`);
    return null;
  }

  if (target.pollId) {
    const poll = await prisma.poll.findUnique({ where: { id: target.pollId } });
    if (!poll || !PUBLIC_STATUSES.includes(poll.status))
      return { error: "Энэ санал асуулгад сэтгэгдэл бичих боломжгүй." };
    await prisma.comment.create({
      data: { body: parsed.data, authorId: guard.user.id, pollId: target.pollId },
    });
    revalidatePath(`/polls/${target.pollId}`);
    return null;
  }

  return { error: "Сэтгэгдлийн зорилт олдсонгүй." };
}

export async function deleteComment(commentId: string, path: string) {
  const user = await currentUser();
  if (!user) return;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return;
  if (comment.authorId !== user.id && user.role !== "ADMIN") return;

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(path);
}

// Сэтгэгдэлд like дарах/буцаах (q35)
export async function toggleCommentLike(commentId: string, path: string) {
  const guard = await requireVerifiedUser();
  if ("error" in guard) return;

  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId: guard.user.id } },
  });
  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.commentLike.create({ data: { commentId, userId: guard.user.id } });
  }
  revalidatePath(path);
}
