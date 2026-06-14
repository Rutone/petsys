import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { deleteComment, type CommentTarget } from "@/actions/comments";
import { CommentForm } from "@/components/comments/comment-form";
import { LikeButton } from "@/components/comments/like-button";
import { formatDateTime } from "@/lib/labels";

export async function CommentsSection({
  target,
  path,
}: {
  target: CommentTarget;
  path: string;
}) {
  const user = await currentUser();
  const comments = await prisma.comment.findMany({
    where: target.petitionId ? { petitionId: target.petitionId } : { pollId: target.pollId },
    include: {
      author: { select: { name: true } },
      _count: { select: { likes: true } },
      likes: user ? { where: { userId: user.id }, select: { id: true } } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Сэтгэгдэл ({comments.length})</h2>

      {user ? (
        user.isVerified ? (
          <CommentForm target={target} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Сэтгэгдэл бичихийн тулд имэйлээ{" "}
            <Link href={`/auth/verify?email=${encodeURIComponent(user.email ?? "")}`} className="text-primary underline underline-offset-2">
              баталгаажуулна уу
            </Link>
            .
          </p>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          Сэтгэгдэл бичихийн тулд{" "}
          <Link href="/auth/login" className="text-primary underline underline-offset-2">
            нэвтэрнэ үү
          </Link>
          .
        </p>
      )}

      <ul className="space-y-3">
        {comments.map((c) => {
          const liked = Array.isArray(c.likes) && c.likes.length > 0;
          return (
            <li key={c.id} className="rounded-xl border bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{c.author.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                  {user && (user.id === c.authorId || user.role === "ADMIN") && (
                    <form action={deleteComment.bind(null, c.id, path)}>
                      <button type="submit" className="text-xs text-destructive hover:underline">
                        Устгах
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{c.body}</p>
              <div className="mt-2">
                <LikeButton
                  commentId={c.id}
                  path={path}
                  count={c._count.likes}
                  liked={liked}
                  disabled={!user || !user.isVerified}
                />
              </div>
            </li>
          );
        })}
        {comments.length === 0 && (
          <li className="text-sm text-muted-foreground">Одоогоор сэтгэгдэл алга.</li>
        )}
      </ul>
    </section>
  );
}
