import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata = { title: "Нууц үг сэргээх" };

export default function ForgotPage() {
  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Нууц үг сэргээх</CardTitle>
          <CardDescription>
            Бүртгэлтэй имэйл хаягаа оруулбал сэргээх холбоос илгээнэ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ForgotForm />
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Нэвтрэх рүү буцах
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
