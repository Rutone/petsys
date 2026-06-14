import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { publicListWhere } from "@/lib/visibility";
import { PetitionCard } from "@/components/petitions/petition-card";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Өргөдлүүд" };

export default async function PetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; cat?: string }>;
}) {
  const { q, sort, cat } = await searchParams;
  const user = await currentUser();
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  const petitions = await prisma.petition.findMany({
    where: {
      ...publicListWhere(user),
      ...(q ? { title: { contains: q } } : {}),
      ...(cat ? { category: { slug: cat } } : {}),
    },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { signatures: true } },
    },
    orderBy: sort === "top" ? { signatures: { _count: "desc" } } : { createdAt: "desc" },
  });

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (sort) p.set("sort", sort);
    if (cat) p.set("cat", cat);
    for (const [k, v] of Object.entries(extra)) {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `/petitions?${s}` : "/petitions";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Өргөдлүүд</h1>
        <Link
          href="/petitions/new"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85"
        >
          + Өргөдөл үүсгэх
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <form className="flex max-w-xs flex-1 gap-2">
            <Input name="q" placeholder="Гарчгаар хайх…" defaultValue={q ?? ""} />
            {sort && <input type="hidden" name="sort" value={sort} />}
            {cat && <input type="hidden" name="cat" value={cat} />}
          </form>
          <div className="flex gap-2 text-sm">
            <Link href={qs({ sort: undefined })} className={`rounded-lg px-2.5 py-1 ${sort !== "top" ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              Шинэ
            </Link>
            <Link href={qs({ sort: "top" })} className={`rounded-lg px-2.5 py-1 ${sort === "top" ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              Их дэмжлэгтэй
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={qs({ cat: undefined })} className={`rounded-full border px-3 py-1 ${!cat ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
            Бүгд
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={qs({ cat: c.slug })}
              className={`rounded-full border px-3 py-1 ${cat === c.slug ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {petitions.map((p) => (
          <PetitionCard key={p.id} petition={p} variant="row" />
        ))}
      </div>
      {petitions.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          {q || cat ? "Хайлтад тохирох өргөдөл олдсонгүй." : "Одоогоор нийтлэгдсэн өргөдөл алга."}
        </p>
      )}
    </div>
  );
}
