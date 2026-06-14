import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { USER_TYPE_LABELS, ROLE_LABELS, STATUS_LABELS, formatDateTime } from "@/lib/labels";

function toCsv(headers: string[], rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))];
  // Excel UTF-8-ийг зөв уншихын тулд BOM нэмнэ
  return "﻿" + lines.join("\r\n");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const me = await currentUser();
  if (!me || me.role !== "ADMIN") {
    return new NextResponse("Хандах эрхгүй", { status: 403 });
  }
  const { type } = await params;

  let csv: string;
  let filename: string;

  if (type === "users") {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    csv = toCsv(
      ["Нэр", "Төрөл", "Код", "Имэйл", "Эрх", "Баталгаажсан", "Идэвхтэй", "Блок", "Сургууль", "Тэнхим", "Бүртгүүлсэн"],
      users.map((u) => [
        u.name,
        USER_TYPE_LABELS[u.userType] ?? u.userType,
        u.code,
        u.email,
        ROLE_LABELS[u.role] ?? u.role,
        u.emailVerified ? "Тийм" : "Үгүй",
        u.isActive ? "Тийм" : "Үгүй",
        u.isBlocked ? "Тийм" : "Үгүй",
        u.school,
        u.department,
        formatDateTime(u.createdAt),
      ])
    );
    filename = "users.csv";
  } else if (type === "petitions") {
    const petitions = await prisma.petition.findMany({
      include: { author: { select: { name: true, code: true } }, category: { select: { name: true } }, _count: { select: { signatures: true } } },
      orderBy: { createdAt: "desc" },
    });
    csv = toCsv(
      ["Гарчиг", "Ангилал", "Төлөв", "Зорилт", "Гарын үсэг", "Зорилт. бүлэг", "Зохиогч", "Код", "Үүсгэсэн"],
      petitions.map((p) => [
        p.title,
        p.category?.name,
        STATUS_LABELS[p.status] ?? p.status,
        p.goal,
        p._count.signatures,
        p.audience,
        p.author.name,
        p.author.code,
        formatDateTime(p.createdAt),
      ])
    );
    filename = "petitions.csv";
  } else if (type === "polls") {
    const polls = await prisma.poll.findMany({
      include: {
        author: { select: { name: true, code: true } },
        options: { include: { _count: { select: { votes: true } } } },
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    csv = toCsv(
      ["Асуулт", "Төлөв", "Нийт санал", "Сонголтууд (санал)", "Зорилт. бүлэг", "Зохиогч", "Үүсгэсэн"],
      polls.map((p) => [
        p.question,
        STATUS_LABELS[p.status] ?? p.status,
        p._count.votes,
        p.options.map((o) => `${o.text}: ${o._count.votes}`).join(" | "),
        p.audience,
        p.author.name,
        formatDateTime(p.createdAt),
      ])
    );
    filename = "polls.csv";
  } else {
    return new NextResponse("Тодорхойгүй төрөл", { status: 404 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
