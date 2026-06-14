import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { publicListWhere } from "@/lib/visibility";
import { PetitionCard } from "@/components/petitions/petition-card";
import { PollCard } from "@/components/polls/poll-card";

export default async function HomePage() {
  const user = await currentUser();
  const visible = publicListWhere(user);

  const [petitionCount, signatureCount, voteCount, latestPetitions, latestPolls] =
    await Promise.all([
      prisma.petition.count({ where: visible }),
      prisma.signature.count(),
      prisma.vote.count(),
      prisma.petition.findMany({
        where: visible,
        include: {
          author: { select: { name: true } },
          category: { select: { name: true } },
          _count: { select: { signatures: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.poll.findMany({
        where: visible,
        include: {
          author: { select: { name: true } },
          _count: { select: { votes: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

  const stats = [
    { label: "Нийтлэгдсэн өргөдөл", value: petitionCount },
    { label: "Цугласан гарын үсэг", value: signatureCount },
    { label: "Өгөгдсөн санал", value: voteCount },
  ];

  return (
    <div className="space-y-12">
      <section className="space-y-5 py-10 text-center">
        <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          ШУТИС-ийн оюутан бүрийн дуу хоолой сонсогдох ёстой
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Өргөдөл үүсгэж гарын үсэг цуглуул, санал асуулга явуулж сургуулийнхаа шийдвэрт нөлөөл.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/petitions/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85"
          >
            Өргөдөл үүсгэх
          </Link>
          {!user && (
            <Link
              href="/auth/register"
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Бүртгүүлэх
            </Link>
          )}
          <Link
            href="/polls"
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Санал асуулга үзэх
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Сүүлийн өргөдлүүд</h2>
          <Link href="/petitions" className="text-sm text-primary hover:underline">
            Бүгдийг үзэх →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {latestPetitions.map((p) => (
            <PetitionCard key={p.id} petition={p} />
          ))}
        </div>
        {latestPetitions.length === 0 && (
          <p className="text-sm text-muted-foreground">Одоогоор идэвхтэй өргөдөл алга.</p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Идэвхтэй санал асуулга</h2>
          <Link href="/polls" className="text-sm text-primary hover:underline">
            Бүгдийг үзэх →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {latestPolls.map((p) => (
            <PollCard key={p.id} poll={p} />
          ))}
        </div>
        {latestPolls.length === 0 && (
          <p className="text-sm text-muted-foreground">Одоогоор идэвхтэй санал асуулга алга.</p>
        )}
      </section>
    </div>
  );
}
