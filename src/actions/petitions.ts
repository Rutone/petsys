"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireVerifiedUser, currentUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { notify, notifyModerators } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";
import { saveUpload, MAX_FILES } from "@/lib/upload";
import { SIGNABLE_STATUSES } from "@/lib/labels";
import { USER_TYPES } from "@/lib/labels";
import type { FormState } from "@/actions/auth";

const AUDIENCES = ["ALL", ...USER_TYPES] as const;

// Босго тоо (goal) ба хаах огноог үүсгэгч сонгохгүй — модератор/админ зөвшөөрөхдөө тогтооно.
const petitionSchema = z.object({
  title: z.string().trim().min(5, "Гарчиг хамгийн багадаа 5 тэмдэгт байна.").max(150, "Гарчиг хэт урт байна."),
  description: z
    .string()
    .trim()
    .min(20, "Тайлбар хамгийн багадаа 20 тэмдэгт байна.")
    .max(5000, "Тайлбар хэт урт байна."),
  categoryId: z.string().trim().optional(),
  audience: z.enum(AUDIENCES).default("ALL"),
});

async function handleAttachments(formData: FormData): Promise<
  { files: { url: string; filename: string; mimeType: string; size: number }[] } | { error: string }
> {
  const raw = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (raw.length === 0) return { files: [] };
  if (raw.length > MAX_FILES) return { error: `Хамгийн ихдээ ${MAX_FILES} файл хавсаргана.` };
  try {
    const files = await Promise.all(raw.map((f) => saveUpload(f)));
    return { files };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function createPetition(_prev: FormState, formData: FormData): Promise<FormState> {
  const guard = await requireVerifiedUser();
  if ("error" in guard) return { error: guard.error };

  const limited = await rateLimit("create-petition", 10, 60 * 60 * 1000);
  if (!limited.ok) return { error: limited.error };

  const parsed = petitionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId") || undefined,
    audience: formData.get("audience") || "ALL",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Талбаруудаа шалгана уу." };
  }

  const att = await handleAttachments(formData);
  if ("error" in att) return { error: att.error };

  // goal, closesAt нь null — модератор зөвшөөрөхдөө тогтооно
  const petition = await prisma.petition.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId || null,
      audience: parsed.data.audience,
      authorId: guard.user.id,
      attachments: { create: att.files },
    },
  });

  await logAudit({
    actorId: guard.user.id,
    action: "CREATE_PETITION",
    entityType: "PETITION",
    entityId: petition.id,
    detail: petition.title,
  });
  await notifyModerators({
    type: "PETITION_PENDING",
    title: "Шинэ өргөдөл зөвшөөрөл хүлээж байна",
    body: petition.title,
    link: `/petitions/${petition.id}`,
  });

  revalidatePath("/petitions");
  redirect(`/petitions/${petition.id}`);
}

export async function signPetition(petitionId: string, _prev: FormState): Promise<FormState> {
  const guard = await requireVerifiedUser();
  if ("error" in guard) return { error: guard.error };

  const petition = await prisma.petition.findUnique({ where: { id: petitionId } });
  if (!petition) return { error: "Өргөдөл олдсонгүй." };
  if (!SIGNABLE_STATUSES.includes(petition.status))
    return { error: "Энэ өргөдөлд гарын үсэг зурах боломжгүй." };
  if (petition.closesAt && petition.closesAt <= new Date())
    return { error: "Өргөдлийн хугацаа дууссан байна." };

  try {
    await prisma.signature.create({ data: { petitionId, userId: guard.user.id } });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return { error: "Та энэ өргөдөлд аль хэдийн гарын үсэг зурсан байна." };
    }
    throw e;
  }

  await logAudit({
    actorId: guard.user.id,
    action: "SIGN",
    entityType: "PETITION",
    entityId: petitionId,
  });

  // Зорилтот тоонд хүрсэн эсэхийг шалгаж зохиогчид мэдэгдэх (q47)
  const count = await prisma.signature.count({ where: { petitionId } });
  if (petition.goal != null && count === petition.goal) {
    await notify({
      userId: petition.authorId,
      type: "GOAL_REACHED",
      title: "Таны өргөдөл зорилтот тоонд хүрлээ!",
      body: petition.title,
      link: `/petitions/${petition.id}`,
    });
  }

  revalidatePath(`/petitions/${petitionId}`);
  revalidatePath("/petitions");
  return { success: "Гарын үсэг амжилттай зурлаа. Танд баярлалаа!" };
}

// Гарын үсгээ буцаах (q24)
export async function unsignPetition(petitionId: string, _prev: FormState): Promise<FormState> {
  const guard = await requireVerifiedUser();
  if ("error" in guard) return { error: guard.error };

  await prisma.signature.deleteMany({ where: { petitionId, userId: guard.user.id } });
  await logAudit({
    actorId: guard.user.id,
    action: "UNSIGN",
    entityType: "PETITION",
    entityId: petitionId,
  });

  revalidatePath(`/petitions/${petitionId}`);
  revalidatePath("/petitions");
  return { success: "Гарын үсгээ буцаалаа." };
}

// Зохиогч өргөдлөө устгах — зөвхөн гарын үсэг цуглахаас өмнө (q18). Admin хэзээ ч.
export async function deletePetition(petitionId: string) {
  const user = await currentUser();
  if (!user) return;

  const petition = await prisma.petition.findUnique({
    where: { id: petitionId },
    include: { _count: { select: { signatures: true } } },
  });
  if (!petition) return;

  const isAuthor = petition.authorId === user.id;
  const admin = user.role === "ADMIN";
  if (!isAuthor && !admin) return;
  // Зохиогчийн хувьд зөвхөн гарын үсэггүй үед
  if (isAuthor && !admin && petition._count.signatures > 0) return;

  await prisma.petition.delete({ where: { id: petitionId } });
  await logAudit({
    actorId: user.id,
    action: "DELETE_PETITION",
    entityType: "PETITION",
    entityId: petitionId,
    detail: petition.title,
  });
  revalidatePath("/petitions");
  redirect("/petitions");
}

// Татгалзсан өргөдлийг засаад дахин илгээх (q17, q39) — статус PENDING болж дахин хяналтад орно.
const editSchema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(20).max(5000),
});

export async function editPetition(petitionId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const guard = await requireVerifiedUser();
  if ("error" in guard) return { error: guard.error };

  const petition = await prisma.petition.findUnique({ where: { id: petitionId } });
  if (!petition) return { error: "Өргөдөл олдсонгүй." };
  if (petition.authorId !== guard.user.id) return { error: "Зөвхөн зохиогч засах боломжтой." };

  const parsed = editSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: "Гарчиг 5+, тайлбар 20+ тэмдэгт байх ёстой." };

  await prisma.petition.update({
    where: { id: petitionId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: "PENDING",
      rejectReason: null,
    },
  });
  await notifyModerators({
    type: "PETITION_PENDING",
    title: "Засварласан өргөдөл дахин хяналт хүлээж байна",
    body: parsed.data.title,
    link: `/petitions/${petitionId}`,
  });

  revalidatePath(`/petitions/${petitionId}`);
  return { success: "Өргөдөл засагдаж, дахин хяналтад илгээгдлээ." };
}
