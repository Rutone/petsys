import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser, isModerator } from "@/lib/session";
import { canSeeAudience } from "@/lib/visibility";
import { StatusBadge } from "@/components/status-badge";
import { VoteForm } from "@/components/polls/vote-form";
import { CommentsSection } from "@/components/comments/comments-section";
import { formatDate, AUDIENCE_LABELS, PUBLIC_STATUSES } from "@/lib/labels";

export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();

  const poll = await prisma.poll.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      options: { include: { _count: { select: { votes: true } } } },
      _count: { select: { votes: true } },
    },
  });
  if (!poll) notFound();

  const isOwner = user !== null && user.id === poll.authorId;
  const mod = isModerator(user);
  const isPublic = PUBLIC_STATUSES.includes(poll.status);
  const canView = (isPublic && canSeeAudience(user, poll.audience)) || isOwner || mod;
  if (!canView) notFound();

  const userVote = user
    ? await prisma.vote.findUnique({
        where: { pollId_userId: { pollId: id, userId: user.id } },
      })
    : null;

  const ended = poll.endsAt !== null && poll.endsAt <= new Date();
  const displayStatus = poll.status === "APPROVED" && ended ? "CLOSED" : poll.status;
  const canVote =
    user !== null && user.isVerified && poll.status === "APPROVED" && !ended && !userVote;
  const total = poll._count.votes;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {poll.status === "PENDING" && (
        <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
          Энэ санал асуулга админы зөвшөөрөл хүлээж байна. Зөвхөн та (болон админ) харж байна.
        </p>
      )}
      {poll.status === "REJECTED" && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Энэ санал асуулгыг татгалзсан.
          {poll.rejectReason && ` Шалтгаан: ${poll.rejectReason}`}
        </p>
      )}

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {poll.audience !== "ALL" && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {AUDIENCE_LABELS[poll.audience]}
            </span>
          )}
          <StatusBadge status={displayStatus} />
        </div>
        <h1 className="text-2xl font-bold">{poll.question}</h1>
        <p className="text-sm text-muted-foreground">
          {poll.author.name} · {formatDate(poll.createdAt)}
          {poll.endsAt && ` · Дуусах огноо: ${formatDate(poll.endsAt)}`}
        </p>
      </div>

      {poll.description && (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{poll.description}</p>
      )}

      <div className="space-y-4 rounded-xl border bg-card p-4">
        {canVote ? (
          <VoteForm pollId={poll.id} options={poll.options.map((o) => ({ id: o.id, text: o.text }))} />
        ) : (
          <div className="space-y-3">
            {userVote && (
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                ✓ Таны санал бүртгэгдсэн
              </p>
            )}
            {!user && poll.status === "APPROVED" && !ended && (
              <p className="text-sm text-muted-foreground">
                Санал өгөхийн тулд{" "}
                <Link href="/auth/login" className="text-primary underline underline-offset-2">
                  нэвтэрнэ үү
                </Link>
                .
              </p>
            )}
            {user && !user.isVerified && poll.status === "APPROVED" && !ended && (
              <p className="text-sm text-muted-foreground">
                Санал өгөхийн тулд имэйлээ{" "}
                <Link
                  href={`/auth/verify?email=${encodeURIComponent(user.email ?? "")}`}
                  className="text-primary underline underline-offset-2"
                >
                  баталгаажуулна уу
                </Link>
                .
              </p>
            )}
            <div className="space-y-3">
              {poll.options.map((o) => {
                const count = o._count.votes;
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                const isMine = userVote?.optionId === o.id;
                return (
                  <div key={o.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className={isMine ? "font-semibold" : ""}>
                        {o.text}
                        {isMine && " · таны санал"}
                      </span>
                      <span className="text-muted-foreground">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${isMine ? "bg-primary" : "bg-primary/50"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Нийт {total} санал</p>
          </div>
        )}
      </div>

      {isPublic && <CommentsSection target={{ pollId: poll.id }} path={`/polls/${poll.id}`} />}
    </div>
  );
}
