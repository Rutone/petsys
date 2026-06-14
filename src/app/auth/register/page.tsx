import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Бүртгүүлэх" };

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Бүртгүүлэх</CardTitle>
          <CardDescription>
            Оюутны код болон имэйл хаягаараа бүртгүүлнэ. Нэг оюутны код нэг л бүртгэлтэй байна.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            Бүртгэлтэй юу?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Нэвтрэх
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
