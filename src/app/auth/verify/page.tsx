import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifyForm } from "@/components/auth/verify-form";

export const metadata = { title: "Имэйл баталгаажуулах" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Имэйл баталгаажуулах</CardTitle>
          <CardDescription>
            Имэйл хаяг руу тань 6 оронтой код илгээсэн. (Хөгжүүлэлтийн горимд код нь серверийн
            консол дээр хэвлэгдэнэ.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyForm email={email ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
