"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireModerator, requireAdmin } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { PETITION_STATUS_FLOW } from "@/lib/labels";
import type { FormState } from "@/actions/auth";

function revalidatePetition(id: string) {
  revalidatePath("/moderation");
  revalidatePath("/admin");
  revalidatePath("/petitions");
  revalidatePath(`/petitions/${id}`);
  revalidatePath("/");
}

function revalidatePoll(id: string) {
  revalidatePath("/moderation");
  revalidatePath("/admin");
  revalidatePath("/polls");
  revalidatePath(`/polls/${id}`);
  revalidatePath("/");
}

// ---- Өргөдөл зөвшөөрөх / татгалзах (модератор + админ) ----

// Зөвшөөрөхдөө модератор/админ босго тоо (goal) ба хаах огноог тогтооно
export async function approvePetition(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const guard = await requireModerator();
  if ("error" in guard) return { error: "Хандах эрхгүй." };

  const goal = Number(formData.get("goal"));
  if (!Number.isInteger(goal) || goal < 5 || goal > 100000) {
    return { error: "Шаардагдах гарын үсгийн тоо 5–100000 хооронд бүхэл тоо байна." };
  }

  let closesAt: Date | null = null;
  const closesRaw = String(formData.get("closesAt") ?? "").trim();
  if (closesRaw) {
    closesAt = new Date(closesRaw);
    if (Number.isNaN(closesAt.getTime())) return { error: "Хаагдах огноо буруу байна." };
    if (closesAt <= new Date()) return { error: "Хаагдах огноо ирээдүйд байх ёстой." };
  }

  const p = await prisma.petition.update({
    where: { id },
    data: { status: "APPROVED", rejectReason: null, goal, closesAt },
  });
  await logAudit({
    actorId: guard.user.id,
    action: "APPROVE_PETITION",
    entityType: "PETITION",
    entityId: id,
    detail: `goal=${goal}${closesAt ? `, хаах=${closesRaw}` : ""}`,
  });
  await notify({
    userId: p.authorId,
    type: "PETITION_APPROVED",
    title: "Таны өргөдөл зөвшөөрөгдлөө",
    body: `«${p.title}» нийтэд харагдаж эхэллээ. Шаардагдах гарын үсэг: ${goal}.`,
    link: `/petitions/${id}`,
  });
  revalidatePetition(id);
  return { success: "Зөвшөөрлөө." };
}

export async function rejectPetition(id: string, formData: FormData) {
  const guard = await requireModerator();
  if ("error" in guard) return;
  const reason = String(formData.get("reason") ?? "").trim();
  const p = await prisma.petition.update({
    where: { id },
    data: { status: "REJECTED", rejectReason: reason || null },
  });
  await logAudit({ actorId: guard.user.id, action: "REJECT_PETITION", entityType: "PETITION", entityId: id, detail: reason });
  await notify({
    userId: p.authorId,
    type: "PETITION_REJECTED",
    title: "Таны өргөдлийг татгалзлаа",
    body: reason ? `Шалтгаан: ${reason}` : `«${p.title}» өргөдлийг татгалзсан.`,
    link: `/petitions/${id}`,
  });
  revalidatePetition(id);
}

// Статусын урсгал (DISCUSSING / IN_PROGRESS / RESOLVED / CLOSED) — q23
export async function setPetitionStatus(id: string, formData: FormData) {
  const guard = await requireModerator();
  if ("error" in guard) return;
  const status = String(formData.get("status") ?? "");
  if (!PETITION_STATUS_FLOW.includes(status)) return;

  const p = await prisma.petition.update({ where: { id }, data: { status } });
  await logAudit({ actorId: guard.user.id, action: "SET_PETITION_STATUS", entityType: "PETITION", entityId: id, detail: status });
  await notify({
    userId: p.authorId,
    type: "PETITION_STATUS",
    title: "Таны өргөдлийн төлөв шинэчлэгдлээ",
    body: `«${p.title}» — шинэ төлөв.`,
    link: `/petitions/${id}`,
  });
  revalidatePetition(id);
}

// Албан хариу нэмэх (q22)
export async function setOfficialResponse(id: string, formData: FormData) {
  const guard = await requireModerator();
  if ("error" in guard) return;
  const text = String(formData.get("response") ?? "").trim();

  const p = await prisma.petition.update({
    where: { id },
    data: {
      officialResponse: text || null,
      officialResponseAt: text ? new Date() : null,
    },
  });
  await logAudit({ actorId: guard.user.id, action: "OFFICIAL_RESPONSE", entityType: "PETITION", entityId: id });
  if (text) {
    await notify({
      userId: p.authorId,
      type: "PETITION_RESPONSE",
      title: "Таны өргөдөлд албан хариу ирлээ",
      body: `«${p.title}»`,
      link: `/petitions/${id}`,
    });
  }
  revalidatePetition(id);
}

// ---- Санал асуулга зөвшөөрөх / татгалзах / хаах ----

export async function approvePoll(id: string) {
  const guard = await requireModerator();
  if ("error" in guard) return;
  const p = await prisma.poll.update({ where: { id }, data: { status: "APPROVED", rejectReason: null } });
  await logAudit({ actorId: guard.user.id, action: "APPROVE_POLL", entityType: "POLL", entityId: id });
  await notify({
    userId: p.authorId,
    type: "POLL_APPROVED",
    title: "Таны санал асуулга зөвшөөрөгдлөө",
    body: `«${p.question}» нийтэд харагдаж эхэллээ.`,
    link: `/polls/${id}`,
  });
  revalidatePoll(id);
}

export async function rejectPoll(id: string, formData: FormData) {
  const guard = await requireModerator();
  if ("error" in guard) return;
  const reason = String(formData.get("reason") ?? "").trim();
  const p = await prisma.poll.update({ where: { id }, data: { status: "REJECTED", rejectReason: reason || null } });
  await logAudit({ actorId: guard.user.id, action: "REJECT_POLL", entityType: "POLL", entityId: id, detail: reason });
  await notify({
    userId: p.authorId,
    type: "POLL_REJECTED",
    title: "Таны санал асуулгыг татгалзлаа",
    body: reason ? `Шалтгаан: ${reason}` : `«${p.question}»`,
    link: `/polls/${id}`,
  });
  revalidatePoll(id);
}

export async function closePoll(id: string) {
  const guard = await requireModerator();
  if ("error" in guard) return;
  await prisma.poll.update({ where: { id }, data: { status: "CLOSED" } });
  await logAudit({ actorId: guard.user.id, action: "CLOSE_POLL", entityType: "POLL", entityId: id });
  revalidatePoll(id);
}

// Нийтлэгдсэн өргөдөл/асуулгыг буцаан нуух (q40) — зөвхөн админ
export async function hidePetition(id: string) {
  const guard = await requireAdmin();
  if ("error" in guard) return;
  await prisma.petition.update({ where: { id }, data: { status: "REJECTED", rejectReason: "Админаар нуугдсан" } });
  await logAudit({ actorId: guard.user.id, action: "HIDE_PETITION", entityType: "PETITION", entityId: id });
  revalidatePetition(id);
}

export async function hidePoll(id: string) {
  const guard = await requireAdmin();
  if ("error" in guard) return;
  await prisma.poll.update({ where: { id }, data: { status: "REJECTED", rejectReason: "Админаар нуугдсан" } });
  await logAudit({ actorId: guard.user.id, action: "HIDE_POLL", entityType: "POLL", entityId: id });
  revalidatePoll(id);
}

// ---- Хэрэглэгч удирдах (зөвхөн админ) ----

export async function setUserRole(userId: string, formData: FormData) {
  const guard = await requireAdmin();
  if ("error" in guard) return;
  const role = String(formData.get("role") ?? "");
  if (!["USER", "MODERATOR", "ADMIN"].includes(role)) return;
  if (userId === guard.user.id) return; // өөрийн эрхээ бууруулахаас сэргийлнэ

  await prisma.user.update({ where: { id: userId }, data: { role } });
  await logAudit({ actorId: guard.user.id, action: "SET_USER_ROLE", entityType: "USER", entityId: userId, detail: role });
  revalidatePath("/admin/users");
}

export async function toggleUserBlock(userId: string) {
  const guard = await requireAdmin();
  if ("error" in guard) return;
  if (userId === guard.user.id) return;

  const u = await prisma.user.findUnique({ where: { id: userId }, select: { isBlocked: true } });
  if (!u) return;
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: !u.isBlocked } });
  await logAudit({
    actorId: guard.user.id,
    action: u.isBlocked ? "UNBLOCK_USER" : "BLOCK_USER",
    entityType: "USER",
    entityId: userId,
  });
  revalidatePath("/admin/users");
}

export async function toggleUserActive(userId: string) {
  const guard = await requireAdmin();
  if ("error" in guard) return;
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } });
  if (!u) return;
  await prisma.user.update({ where: { id: userId }, data: { isActive: !u.isActive } });
  await logAudit({
    actorId: guard.user.id,
    action: u.isActive ? "DEACTIVATE_USER" : "ACTIVATE_USER",
    entityType: "USER",
    entityId: userId,
  });
  revalidatePath("/admin/users");
}
