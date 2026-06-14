import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata = { title: "Шинэ нууц үг" };

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Шинэ нууц үг тохируулах</CardTitle>
          <CardDescription>Шинэ нууц үгээ оруулна уу.</CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <ResetForm token={token} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Холбоос буруу байна.{" "}
              <Link href="/auth/forgot" className="text-primary underline underline-offset-2">
                Дахин хүсэлт илгээх
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
