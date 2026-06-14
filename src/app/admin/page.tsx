import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { Users, FileText, BarChart3, ShieldCheck, ScrollText, Download } from "lucide-react";

export const metadata = { title: "Админ" };

export default async function AdminPage() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const [
    userCount,
    activeUserCount,
    petitionCount,
    pendingPetitionCount,
    signatureCount,
    pollCount,
    voteCount,
    commentCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true, isBlocked: false } }),
    prisma.petition.count(),
    prisma.petition.count({ where: { status: "PENDING" } }),
    prisma.signature.count(),
    prisma.poll.count(),
    prisma.vote.count(),
    prisma.comment.count(),
  ]);

  const stats = [
    { label: "Нийт хэрэглэгч", value: userCount },
    { label: "Идэвхтэй хэрэглэгч", value: activeUserCount },
    { label: "Нийт өргөдөл", value: petitionCount },
    { label: "Нийт гарын үсэг", value: signatureCount },
    { label: "Нийт санал асуулга", value: pollCount },
    { label: "Нийт санал", value: voteCount },
    { label: "Нийт сэтгэгдэл", value: commentCount },
    { label: "Хүлээгдэж буй өргөдөл", value: pendingPetitionCount },
  ];

  const links = [
    { href: "/moderation", label: "Модерац", desc: "Зөвшөөрөл, татгалзах, төлөв", icon: ShieldCheck },
    { href: "/admin/users", label: "Хэрэглэгч удирдах", desc: "Эрх, блок, идэвх", icon: Users },
    { href: "/admin/audit", label: "Үйлдлийн түүх", desc: "Audit log", icon: ScrollText },
  ];

  const exports = [
    { href: "/admin/export/users", label: "Хэрэглэгчид (CSV)" },
    { href: "/admin/export/petitions", label: "Өргөдлүүд (CSV)" },
    { href: "/admin/export/polls", label: "Санал асуулгууд (CSV)" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Админ самбар</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
              <Icon className="size-6 text-primary" />
              <p className="mt-3 font-semibold">{l.label}</p>
              <p className="text-sm text-muted-foreground">{l.desc}</p>
            </Link>
          );
        })}
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Download className="size-5" /> Тайлан татах
        </h2>
        <div className="flex flex-wrap gap-2">
          {exports.map((e) => (
            <a
              key={e.href}
              href={e.href}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              {e.label}
            </a>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        <FileText className="mr-1 inline size-3" />
        Өргөдөл/санал асуулга зөвшөөрөх ажлыг <Link href="/moderation" className="text-primary underline">Модерацийн самбар</Link>-аас гүйцэтгэнэ.
        <BarChart3 className="ml-2 mr-1 inline size-3" />
      </p>
    </div>
  );
}
