import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/labels";

export type PollCardData = {
  id: string;
  question: string;
  description: string;
  status: string;
  endsAt: Date | null;
  createdAt: Date;
  author: { name: string };
  _count: { votes: number };
};

export function PollCard({
  poll,
  variant = "grid",
}: {
  poll: PollCardData;
  variant?: "grid" | "row";
}) {
  const ended = poll.endsAt !== null && poll.endsAt <= new Date();
  const status = poll.status === "APPROVED" && ended ? "CLOSED" : poll.status;

  const meta = (
    <p className="text-xs text-muted-foreground">
      🗳 {poll._count.votes} санал · {poll.author.name} · {formatDate(poll.createdAt)}
      {poll.endsAt && ` · Дуусах: ${formatDate(poll.endsAt)}`}
    </p>
  );

  if (variant === "row") {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 space-y-1.5">
            <StatusBadge status={status} />
            <Link
              href={`/polls/${poll.id}`}
              className="block text-base font-semibold leading-snug hover:underline"
            >
              {poll.question}
            </Link>
            {poll.description && (
              <p className="line-clamp-1 text-sm text-muted-foreground">{poll.description}</p>
            )}
            {meta}
          </div>
          <div className="shrink-0 border-t pt-3 text-center sm:w-28 sm:border-l sm:border-t-0 sm:pt-0">
            <p className="text-2xl font-bold">{poll._count.votes}</p>
            <p className="text-xs text-muted-foreground">санал</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>
            <Link href={`/polls/${poll.id}`} className="hover:underline">
              {poll.question}
            </Link>
          </CardTitle>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {poll.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{poll.description}</p>
        )}
        {meta}
      </CardContent>
    </Card>
  );
}
