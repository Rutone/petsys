import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewPollForm } from "@/components/polls/new-poll-form";

export const metadata = { title: "Санал асуулга үүсгэх" };

export default async function NewPollPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Шинэ санал асуулга үүсгэх</CardTitle>
          <CardDescription>
            Санал асуулга тань админы зөвшөөрөл авсны дараа нийтэд харагдана.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.isVerified ? (
            <NewPollForm />
          ) : (
            <p className="text-sm text-muted-foreground">
              Санал асуулга үүсгэхийн тулд эхлээд имэйл хаягаа{" "}
              <Link
                href={`/auth/verify?email=${encodeURIComponent(user.email ?? "")}`}
                className="text-primary underline underline-offset-2"
              >
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
