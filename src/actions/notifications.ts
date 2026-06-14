"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function markNotificationRead(id: string) {
  const me = await currentUser();
  if (!me) return;
  await prisma.notification.updateMany({
    where: { id, userId: me.id },
    data: { read: true },
  });
  revalidatePath("/");
}

export async function markAllNotificationsRead() {
  const me = await currentUser();
  if (!me) return;
  await prisma.notification.updateMany({
    where: { userId: me.id, read: false },
    data: { read: true },
  });
  revalidatePath("/");
}
