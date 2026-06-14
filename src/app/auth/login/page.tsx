import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Нэвтрэх" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; reset?: string }>;
}) {
  const { verified, reset } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Нэвтрэх</CardTitle>
          <CardDescription>Бүртгэлтэй имэйл хаяг, нууц үгээрээ нэвтэрнэ үү.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verified === "1" && (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              Имэйл амжилттай баталгаажлаа. Одоо нэвтэрч орно уу.
            </p>
          )}
          {reset === "1" && (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              Нууц үг шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтэрнэ үү.
            </p>
          )}
          <LoginForm />
          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/forgot" className="text-muted-foreground hover:text-foreground hover:underline">
              Нууц үг мартсан?
            </Link>
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Бүртгүүлэх
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
