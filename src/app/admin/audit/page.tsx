import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { formatDateTime } from "@/lib/labels";

export const metadata = { title: "Үйлдлийн түүх" };

const ACTION_LABELS: Record<string, string> = {
  CREATE_PETITION: "Өргөдөл үүсгэсэн",
  DELETE_PETITION: "Өргөдөл устгасан",
  SIGN: "Гарын үсэг зурсан",
  UNSIGN: "Гарын үсэг буцаасан",
  APPROVE_PETITION: "Өргөдөл зөвшөөрсөн",
  REJECT_PETITION: "Өргөдөл татгалзсан",
  SET_PETITION_STATUS: "Өргөдлийн төлөв өөрчилсөн",
  OFFICIAL_RESPONSE: "Албан хариу өгсөн",
  HIDE_PETITION: "Өргөдөл нуусан",
  CREATE_POLL: "Санал асуулга үүсгэсэн",
  APPROVE_POLL: "Санал асуулга зөвшөөрсөн",
  REJECT_POLL: "Санал асуулга татгалзсан",
  CLOSE_POLL: "Санал асуулга хаасан",
  HIDE_POLL: "Санал асуулга нуусан",
  VOTE: "Санал өгсөн",
  SET_USER_ROLE: "Эрх өөрчилсөн",
  BLOCK_USER: "Хэрэглэгч блоклосон",
  UNBLOCK_USER: "Блок цуцалсан",
  ACTIVATE_USER: "Идэвхжүүлсэн",
  DEACTIVATE_USER: "Идэвхгүй болгосон",
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const me = await currentUser();
  if (!me || me.role !== "ADMIN") redirect("/");

  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? 1) || 1);
  const perPage = 50;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { actor: { select: { name: true, code: true } } },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * perPage,
      take: perPage,
    }),
    prisma.auditLog.count(),
  ]);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Үйлдлийн түүх (Audit log)</h1>
      <p className="text-sm text-muted-foreground">Нийт {total} бичлэг</p>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Огноо</th>
              <th className="px-3 py-2">Хэн</th>
              <th className="px-3 py-2">Үйлдэл</th>
              <th className="px-3 py-2">Обьект</th>
              <th className="px-3 py-2">Тайлбар</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                  {formatDateTime(l.createdAt)}
                </td>
                <td className="px-3 py-2 text-xs">
                  {l.actor.name} ({l.actor.code})
                </td>
                <td className="px-3 py-2 text-xs font-medium">{ACTION_LABELS[l.action] ?? l.action}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {l.entityType}:{l.entityId.slice(0, 8)}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{l.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 text-sm">
          {pageNum > 1 && (
            <a href={`/admin/audit?page=${pageNum - 1}`} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
              ← Өмнөх
            </a>
          )}
          <span className="px-3 py-1.5 text-muted-foreground">
            {pageNum} / {totalPages}
          </span>
          {pageNum < totalPages && (
            <a href={`/admin/audit?page=${pageNum + 1}`} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
              Дараах →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
