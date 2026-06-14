import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser, isModerator } from "@/lib/session";
import { canSeeAudience } from "@/lib/visibility";
import { deletePetition } from "@/actions/petitions";
import { StatusBadge } from "@/components/status-badge";
import { ProgressBar } from "@/components/petitions/progress-bar";
import { SignForm } from "@/components/petitions/sign-form";
import { PetitionEditForm } from "@/components/petitions/petition-edit-form";
import { CommentsSection } from "@/components/comments/comments-section";
import {
  formatDate,
  formatDateTime,
  timeLeft,
  AUDIENCE_LABELS,
  PUBLIC_STATUSES,
  SIGNABLE_STATUSES,
} from "@/lib/labels";

export default async function PetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();

  const petition = await prisma.petition.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
      organization: { select: { name: true, verified: true } },
      attachments: true,
      related: { select: { id: true, title: true } },
      relatedTo: { select: { id: true, title: true } },
      _count: { select: { signatures: true } },
    },
  });
  if (!petition) notFound();

  const isOwner = user !== null && user.id === petition.authorId;
  const mod = isModerator(user);
  const isPublic = PUBLIC_STATUSES.includes(petition.status);
  const canView = (isPublic && canSeeAudience(user, petition.audience)) || isOwner || mod;
  if (!canView) notFound();

  const signed = user
    ? Boolean(
        await prisma.signature.findUnique({
          where: { petitionId_userId: { petitionId: id, userId: user.id } },
        })
      )
    : false;

  const expired = petition.closesAt !== null && petition.closesAt <= new Date();
  const goalReached = petition.goal != null && petition._count.signatures >= petition.goal;
  const displayStatus =
    SIGNABLE_STATUSES.includes(petition.status) && expired ? "CLOSED" : petition.status;
  const canSign = SIGNABLE_STATUSES.includes(petition.status) && !expired;
  const remaining = petition.closesAt && !expired ? timeLeft(petition.closesAt) : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {petition.status === "PENDING" && (
        <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
          Энэ өргөдөл зөвшөөрөл хүлээж байна. Зөвхөн та (болон модератор/админ) харж байна.
        </p>
      )}
      {petition.status === "REJECTED" && (
        <div className="space-y-3 rounded-lg bg-destructive/10 px-3 py-3 text-sm text-destructive">
          <p>
            Энэ өргөдлийг татгалзсан.
            {petition.rejectReason && ` Шалтгаан: ${petition.rejectReason}`}
          </p>
          {isOwner && (
            <div className="rounded-lg border border-destructive/20 bg-background p-3 text-foreground">
              <p className="mb-2 text-sm font-medium">Засаад дахин илгээх</p>
              <PetitionEditForm
                petitionId={petition.id}
                title={petition.title}
                description={petition.description}
              />
            </div>
          )}
        </div>
      )}
      {goalReached && isPublic && (
        <p className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          🎉 Энэ өргөдөл зорилтот гарын үсгийн тоондоо хүрсэн!
        </p>
      )}
      {petition.officialResponse && (
        <div className="rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3">
          <p className="text-sm font-semibold text-primary">Албан хариу</p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{petition.officialResponse}</p>
          {petition.officialResponseAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDateTime(petition.officialResponseAt)}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {petition.category && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {petition.category.name}
            </span>
          )}
          {petition.audience !== "ALL" && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {AUDIENCE_LABELS[petition.audience]}
            </span>
          )}
          <StatusBadge status={displayStatus} />
        </div>
        <h1 className="text-2xl font-bold">{petition.title}</h1>
        <p className="text-sm text-muted-foreground">
          {petition.organization ? (
            <span className="font-medium text-primary">
              {petition.organization.name}
              {petition.organization.verified && " ✓"}
            </span>
          ) : (
            petition.author.name
          )}{" "}
          · {formatDate(petition.createdAt)}
          {petition.closesAt && ` · Хаагдах: ${formatDate(petition.closesAt)}`}
        </p>
      </div>

      <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{petition.description}</p>

      {petition.attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Хавсралт</p>
          <div className="flex flex-wrap gap-2">
            {petition.attachments.map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border px-3 py-1.5 text-sm text-primary hover:bg-muted"
              >
                📎 {a.filename}
              </a>
            ))}
          </div>
        </div>
      )}

      {(petition.relatedTo || petition.related.length > 0) && (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="mb-1 font-medium">Холбоотой өргөдлүүд</p>
          <ul className="list-inside list-disc text-muted-foreground">
            {petition.relatedTo && (
              <li>
                <Link href={`/petitions/${petition.relatedTo.id}`} className="text-primary hover:underline">
                  {petition.relatedTo.title}
                </Link>{" "}
                (энэ өргөдөл өмнө дурдагдсан)
              </li>
            )}
            {petition.related.map((r) => (
              <li key={r.id}>
                <Link href={`/petitions/${r.id}`} className="text-primary hover:underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4 rounded-xl border bg-card p-4">
        {petition.goal != null ? (
          <ProgressBar value={petition._count.signatures} goal={petition.goal} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Шаардагдах гарын үсгийн тоо болон хугацааг модератор зөвшөөрөхдөө тогтооно.
          </p>
        )}
        {remaining && <p className="text-xs text-muted-foreground">⏳ {remaining}</p>}

        {!isPublic && !signed ? null : !canSign && !signed ? (
          isPublic && (
            <p className="text-sm text-muted-foreground">
              Энэ өргөдөл хаагдсан тул гарын үсэг зурах боломжгүй.
            </p>
          )
        ) : !user ? (
          <p className="text-sm text-muted-foreground">
            Гарын үсэг зурахын тулд{" "}
            <Link href="/auth/login" className="text-primary underline underline-offset-2">
              нэвтэрнэ үү
            </Link>
            .
          </p>
        ) : !user.isVerified ? (
          <p className="text-sm text-muted-foreground">
            Гарын үсэг зурахын тулд имэйлээ{" "}
            <Link href={`/auth/verify?email=${encodeURIComponent(user.email ?? "")}`} className="text-primary underline underline-offset-2">
              баталгаажуулна уу
            </Link>
            .
          </p>
        ) : (
          <SignForm petitionId={petition.id} signed={signed} />
        )}
      </div>

      {/* Устгах: зохиогч (гарын үсэггүй үед) эсвэл админ */}
      {((isOwner && petition._count.signatures === 0) || (user && user.role === "ADMIN")) && (
        <form action={deletePetition.bind(null, petition.id)}>
          <button type="submit" className="text-sm text-destructive hover:underline">
            Өргөдөл устгах
          </button>
        </form>
      )}

      {isPublic && (
        <CommentsSection target={{ petitionId: petition.id }} path={`/petitions/${petition.id}`} />
      )}
    </div>
  );
}
