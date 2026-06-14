import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser, isModerator } from "@/lib/session";
import {
  rejectPetition,
  approvePoll,
  rejectPoll,
  setPetitionStatus,
  setOfficialResponse,
} from "@/actions/admin";
import { deleteComment } from "@/actions/comments";
import { PetitionApproveForm } from "@/components/moderation/petition-approve-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import {
  formatDateTime,
  STATUS_LABELS,
  PETITION_STATUS_FLOW,
  AUDIENCE_LABELS,
} from "@/lib/labels";

export const metadata = { title: "Модерац" };

function hoursSince(d: Date) {
  return Math.floor((Date.now() - d.getTime()) / 3600000);
}

export default async function ModerationPage() {
  const user = await currentUser();
  if (!isModerator(user)) redirect("/");

  const [pendingPetitions, pendingPolls, activePetitions, recentComments] = await Promise.all([
    prisma.petition.findMany({
      where: { status: "PENDING" },
      include: { author: { select: { name: true, code: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.poll.findMany({
      where: { status: "PENDING" },
      include: { author: { select: { name: true, code: true } }, options: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.petition.findMany({
      where: { status: { in: ["APPROVED", "DISCUSSING", "IN_PROGRESS"] } },
      include: { _count: { select: { signatures: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.comment.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Модерацийн самбар</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Хэрэглэгчийн илгээсэн өргөдөл, санал асуулгад <strong>72 цагийн дотор</strong> хариу өгнө үү.
        </p>
      </div>

      {/* Pending petitions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Хүлээгдэж буй өргөдөл ({pendingPetitions.length})</h2>
        {pendingPetitions.length === 0 && (
          <p className="text-sm text-muted-foreground">Хүлээгдэж буй өргөдөл алга.</p>
        )}
        {pendingPetitions.map((p) => {
          const hrs = hoursSince(p.createdAt);
          const overdue = hrs >= 72;
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>
                    <Link href={`/petitions/${p.id}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </CardTitle>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${overdue ? "bg-red-500/15 text-red-700 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
                    {hrs} цаг өнгөрсөн{overdue ? " ⚠" : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                <p className="text-xs text-muted-foreground">
                  {p.author.name} ({p.author.code}) · {formatDateTime(p.createdAt)} ·{" "}
                  {AUDIENCE_LABELS[p.audience]}
                </p>
                <PetitionApproveForm petitionId={p.id} />
                <form action={rejectPetition.bind(null, p.id)} className="flex gap-2">
                  <Input name="reason" placeholder="Татгалзах шалтгаан…" className="max-w-xs" />
                  <button className="rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
                    Татгалзах
                  </button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Pending polls */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Хүлээгдэж буй санал асуулга ({pendingPolls.length})</h2>
        {pendingPolls.length === 0 && (
          <p className="text-sm text-muted-foreground">Хүлээгдэж буй санал асуулга алга.</p>
        )}
        {pendingPolls.map((p) => {
          const hrs = hoursSince(p.createdAt);
          const overdue = hrs >= 72;
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>
                    <Link href={`/polls/${p.id}`} className="hover:underline">
                      {p.question}
                    </Link>
                  </CardTitle>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${overdue ? "bg-red-500/15 text-red-700 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
                    {hrs} цаг{overdue ? " ⚠" : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Сонголтууд: {p.options.map((o) => o.text).join(" / ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.author.name} ({p.author.code}) · {formatDateTime(p.createdAt)} · {AUDIENCE_LABELS[p.audience]}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={approvePoll.bind(null, p.id)}>
                    <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-85">
                      Зөвшөөрөх
                    </button>
                  </form>
                  <form action={rejectPoll.bind(null, p.id)} className="flex flex-1 gap-2">
                    <Input name="reason" placeholder="Татгалзах шалтгаан…" className="max-w-xs" />
                    <button className="rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
                      Татгалзах
                    </button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Active petitions management */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Идэвхтэй өргөдлийн төлөв удирдах</h2>
        {activePetitions.length === 0 && (
          <p className="text-sm text-muted-foreground">Идэвхтэй өргөдөл алга.</p>
        )}
        {activePetitions.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle>
                  <Link href={`/petitions/${p.id}`} className="hover:underline">
                    {p.title}
                  </Link>
                </CardTitle>
                <StatusBadge status={p.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {p._count.signatures}/{p.goal ?? "—"} гарын үсэг
              </p>
              <form action={setPetitionStatus.bind(null, p.id)} className="flex flex-wrap items-center gap-2">
                <select
                  name="status"
                  defaultValue={p.status}
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {PETITION_STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <button className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
                  Төлөв шинэчлэх
                </button>
              </form>
              <form action={setOfficialResponse.bind(null, p.id)} className="space-y-2">
                <Textarea name="response" rows={2} placeholder="Албан хариу бичих…" defaultValue={p.officialResponse ?? ""} />
                <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85">
                  Албан хариу хадгалах
                </button>
              </form>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Comments moderation */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Сүүлийн сэтгэгдлүүд</h2>
        <ul className="space-y-2">
          {recentComments.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3">
              <div className="min-w-0">
                <p className="truncate text-sm">{c.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.author.name} · {formatDateTime(c.createdAt)} ·{" "}
                  <Link href={c.petitionId ? `/petitions/${c.petitionId}` : `/polls/${c.pollId}`} className="underline underline-offset-2">
                    Эх сурвалж
                  </Link>
                </p>
              </div>
              <form action={deleteComment.bind(null, c.id, "/moderation")}>
                <button className="text-xs text-destructive hover:underline">Устгах</button>
              </form>
            </li>
          ))}
          {recentComments.length === 0 && (
            <li className="text-sm text-muted-foreground">Сэтгэгдэл алга.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
