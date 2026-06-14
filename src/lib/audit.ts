import { prisma } from "@/lib/db";

// Аудит лог бүртгэх (q42). Хэн, юу, ямар обьектод хийсэн.
export async function logAudit(params: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  detail?: string;
}) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (e) {
    // Аудит бүртгэл амжилтгүй болсон ч үндсэн үйлдлийг тасалдуулахгүй
    console.error("[audit] бүртгэхэд алдаа:", e);
  }
}
