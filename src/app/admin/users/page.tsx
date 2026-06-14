import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { setUserRole, toggleUserBlock, toggleUserActive } from "@/actions/admin";
import { Input } from "@/components/ui/input";
import { USER_TYPE_LABELS, ROLE_LABELS, formatDate } from "@/lib/labels";

export const metadata = { title: "Хэрэглэгч удирдах" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const me = await currentUser();
  if (!me || me.role !== "ADMIN") redirect("/");
  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { code: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Хэрэглэгч удирдах</h1>

      <form className="flex max-w-md gap-2">
        <Input name="q" placeholder="Нэр, имэйл, кодоор хайх…" defaultValue={q ?? ""} />
        <button className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">Хайх</button>
      </form>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Нэр</th>
              <th className="px-3 py-2">Төрөл / Код</th>
              <th className="px-3 py-2">Имэйл</th>
              <th className="px-3 py-2">Эрх</th>
              <th className="px-3 py-2">Төлөв</th>
              <th className="px-3 py-2">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="align-top">
                <td className="px-3 py-2">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
                </td>
                <td className="px-3 py-2 text-xs">
                  {USER_TYPE_LABELS[u.userType]}
                  <br />
                  {u.code}
                </td>
                <td className="px-3 py-2 text-xs">
                  {u.email}
                  {!u.emailVerified && <span className="ml-1 text-amber-600">(батлаагүй)</span>}
                </td>
                <td className="px-3 py-2">
                  {u.id === me.id ? (
                    <span className="text-xs text-muted-foreground">{ROLE_LABELS[u.role]} (та)</span>
                  ) : (
                    <form action={setUserRole.bind(null, u.id)} className="flex items-center gap-1">
                      <select name="role" defaultValue={u.role} className="h-7 rounded-md border border-input bg-transparent px-1.5 text-xs">
                        <option value="USER">Хэрэглэгч</option>
                        <option value="MODERATOR">Модератор</option>
                        <option value="ADMIN">Админ</option>
                      </select>
                      <button className="rounded-md border px-1.5 py-1 text-xs hover:bg-muted">OK</button>
                    </form>
                  )}
                </td>
                <td className="px-3 py-2 text-xs">
                  {u.isBlocked ? (
                    <span className="text-red-600">Блоклосон</span>
                  ) : u.isActive ? (
                    <span className="text-emerald-600">Идэвхтэй</span>
                  ) : (
                    <span className="text-muted-foreground">Идэвхгүй</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {u.id !== me.id && (
                    <div className="flex flex-col gap-1">
                      <form action={toggleUserBlock.bind(null, u.id)}>
                        <button className="text-xs text-destructive hover:underline">
                          {u.isBlocked ? "Блок цуцлах" : "Блоклох"}
                        </button>
                      </form>
                      <form action={toggleUserActive.bind(null, u.id)}>
                        <button className="text-xs text-muted-foreground hover:underline">
                          {u.isActive ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <p className="text-sm text-muted-foreground">Хэрэглэгч олдсонгүй.</p>}
    </div>
  );
}
