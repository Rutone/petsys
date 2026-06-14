import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, USER_TYPE_LABELS, USER_TYPE_CODE_LABELS } from "@/lib/labels";

export const metadata = { title: "Профайл" };

export default async function ProfilePage() {
  const sessionUser = await currentUser();
  if (!sessionUser) redirect("/auth/login");

  const [user, myPetitions, mySignatures, myPolls, myVotes] = await Promise.all([
    prisma.user.findUnique({ where: { id: sessionUser.id } }),
    prisma.petition.findMany({
      where: { authorId: sessionUser.id },
      include: { _count: { select: { signatures: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.signature.findMany({
      where: { userId: sessionUser.id },
      include: { petition: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.poll.findMany({
      where: { authorId: sessionUser.id },
      include: { _count: { select: { votes: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vote.findMany({
      where: { userId: sessionUser.id },
      include: {
        poll: { select: { id: true, question: true } },
        option: { select: { text: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!user) redirect("/auth/login");

  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-wrap items-start gap-4">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={64}
              height={64}
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
              {initial}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {USER_TYPE_LABELS[user.userType]} · {USER_TYPE_CODE_LABELS[user.userType]}: {user.code}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {(user.school || user.department) && (
              <p className="text-sm text-muted-foreground">
                {[user.school, user.department].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="mt-1 text-sm">
              {user.emailVerified ? (
                <span className="text-emerald-700 dark:text-emerald-400">✓ Имэйл баталгаажсан</span>
              ) : (
                <Link
                  href={`/auth/verify?email=${encodeURIComponent(user.email)}`}
                  className="text-amber-700 underline underline-offset-2 dark:text-amber-400"
                >
                  Имэйл баталгаажуулах шаардлагатай
                </Link>
              )}
            </p>
          </div>
          <Link
            href="/profile/edit"
            className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Профайл засах
          </Link>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Өргөдөл", value: myPetitions.length },
          { label: "Гарын үсэг", value: mySignatures.length },
          { label: "Санал асуулга", value: myPolls.length },
          { label: "Өгсөн санал", value: myVotes.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Миний өргөдлүүд */}
      <Card>
        <CardHeader>
          <CardTitle>Миний өргөдлүүд ({myPetitions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {myPetitions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Та өргөдөл үүсгээгүй байна.{" "}
              <Link href="/petitions/new" className="text-primary underline underline-offset-2">
                Эхний өргөдлөө үүсгэх
              </Link>
            </p>
          ) : (
            <ul className="divide-y">
              {myPetitions.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/petitions/${p.id}`} className="font-medium hover:underline">
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.createdAt)} · {p._count.signatures}/{p.goal ?? "—"} гарын үсэг
                      {p.status === "REJECTED" && p.rejectReason && ` · Шалтгаан: ${p.rejectReason}`}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Гарын үсэг зурсан */}
      <Card>
        <CardHeader>
          <CardTitle>Гарын үсэг зурсан ({mySignatures.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {mySignatures.length === 0 ? (
            <p className="text-sm text-muted-foreground">Гарын үсэг зурсан өргөдөл алга.</p>
          ) : (
            <ul className="divide-y">
              {mySignatures.map((s) => (
                <li key={s.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link href={`/petitions/${s.petition.id}`} className="font-medium hover:underline">
                    {s.petition.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Миний санал асуулгууд */}
      <Card>
        <CardHeader>
          <CardTitle>Миний санал асуулгууд ({myPolls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {myPolls.length === 0 ? (
            <p className="text-sm text-muted-foreground">Үүсгэсэн санал асуулга алга.</p>
          ) : (
            <ul className="divide-y">
              {myPolls.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/polls/${p.id}`} className="font-medium hover:underline">
                      {p.question}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.createdAt)} · {p._count.votes} санал
                      {p.status === "REJECTED" && p.rejectReason && ` · Шалтгаан: ${p.rejectReason}`}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Өгсөн саналууд */}
      <Card>
        <CardHeader>
          <CardTitle>Өгсөн саналууд ({myVotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {myVotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Санал өгсөн асуулга алга.</p>
          ) : (
            <ul className="divide-y">
              {myVotes.map((v) => (
                <li key={v.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link href={`/polls/${v.poll.id}`} className="font-medium hover:underline">
                    {v.poll.question}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Сонголт: {v.option.text} · {formatDate(v.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
