import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewPetitionForm } from "@/components/petitions/new-petition-form";

export const metadata = { title: "Өргөдөл үүсгэх" };

export default async function NewPetitionPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Шинэ өргөдөл үүсгэх</CardTitle>
          <CardDescription>
            Өргөдөл тань зөвшөөрөл авсны дараа нийтэд харагдаж, гарын үсэг цуглуулж эхэлнэ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.isVerified ? (
            <NewPetitionForm categories={categories} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Өргөдөл үүсгэхийн тулд эхлээд имэйл хаягаа{" "}
              <Link href={`/auth/verify?email=${encodeURIComponent(user.email ?? "")}`} className="text-primary underline underline-offset-2">
                баталгаажуулна уу
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
