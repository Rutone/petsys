import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { publicListWhere } from "@/lib/visibility";
import { PollCard } from "@/components/polls/poll-card";

export const metadata = { title: "Санал асуулга" };

export default async function PollsPage() {
  const user = await currentUser();
  const polls = await prisma.poll.findMany({
    where: publicListWhere(user),
    include: {
      author: { select: { name: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Санал асуулга</h1>
        <Link
          href="/polls/new"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85"
        >
          + Санал асуулга үүсгэх
        </Link>
      </div>

      <div className="space-y-3">
        {polls.map((p) => (
          <PollCard key={p.id} poll={p} variant="row" />
        ))}
      </div>
      {polls.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          Одоогоор нийтлэгдсэн санал асуулга алга.
        </p>
      )}
    </div>
  );
}
