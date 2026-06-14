import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ProgressBar } from "@/components/petitions/progress-bar";
import { formatDate, SIGNABLE_STATUSES } from "@/lib/labels";

export type PetitionCardData = {
  id: string;
  title: string;
  description: string;
  goal: number | null;
  status: string;
  closesAt: Date | null;
  createdAt: Date;
  author: { name: string };
  category?: { name: string } | null;
  _count: { signatures: number };
};

export function PetitionCard({
  petition,
  variant = "grid",
}: {
  petition: PetitionCardData;
  variant?: "grid" | "row";
}) {
  const expired = petition.closesAt !== null && petition.closesAt <= new Date();
  const status =
    SIGNABLE_STATUSES.includes(petition.status) && expired ? "CLOSED" : petition.status;

  const meta = (
    <p className="text-xs text-muted-foreground">
      {petition.author.name} · {formatDate(petition.createdAt)}
      {petition.closesAt && ` · Хаагдах: ${formatDate(petition.closesAt)}`}
    </p>
  );

  if (variant === "row") {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {petition.category && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {petition.category.name}
                </span>
              )}
              <StatusBadge status={status} />
            </div>
            <Link
              href={`/petitions/${petition.id}`}
              className="block text-base font-semibold leading-snug hover:underline"
            >
              {petition.title}
            </Link>
            <p className="line-clamp-1 text-sm text-muted-foreground">{petition.description}</p>
            {meta}
          </div>
          <div className="shrink-0 border-t pt-3 sm:w-48 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            {petition.goal != null ? (
              <ProgressBar value={petition._count.signatures} goal={petition.goal} />
            ) : (
              <p className="text-xs text-muted-foreground">Босго тогтоогдоогүй</p>
            )}
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
            <Link href={`/petitions/${petition.id}`} className="hover:underline">
              {petition.title}
            </Link>
          </CardTitle>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {petition.category && (
          <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {petition.category.name}
          </span>
        )}
        <p className="line-clamp-2 text-sm text-muted-foreground">{petition.description}</p>
        {petition.goal != null && (
          <ProgressBar value={petition._count.signatures} goal={petition.goal} />
        )}
        {meta}
      </CardContent>
    </Card>
  );
}
