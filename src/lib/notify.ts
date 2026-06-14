import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

// Хэрэглэгчид мэдэгдэл үүсгэх: сайт доторх (🔔) + имэйл (q47, q48).
export async function notify(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  email?: boolean; // имэйл бас илгээх эсэх
}) {
  const { userId, type, title, body, link, email = true } = params;

  await prisma.notification.create({
    data: { userId, type, title, body, link },
  });

  if (email) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: title,
        text: link ? `${body}\n\nХолбоос: ${link}` : body,
      });
    }
  }
}

// Бүх admin/moderator-т мэдэгдэх (жишээ: шинэ өргөдөл хүлээгдэж байна, q45)
export async function notifyModerators(params: {
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  const mods = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MODERATOR"] }, isBlocked: false },
    select: { id: true },
  });
  await Promise.all(
    mods.map((m) =>
      notify({ userId: m.id, ...params, email: true })
    )
  );
}
