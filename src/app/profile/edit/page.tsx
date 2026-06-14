import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileEditForm } from "@/components/auth/profile-edit-form";
import { PasswordChangeForm } from "@/components/auth/password-change-form";

export const metadata = { title: "Профайл засах" };

export default async function ProfileEditPage() {
  const me = await currentUser();
  if (!me) redirect("/auth/login");

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Профайл засах</h1>

      <Card>
        <CardHeader>
          <CardTitle>Хувийн мэдээлэл</CardTitle>
          <CardDescription>Нэр, сургууль, тэнхим, профайл зураг.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEditForm
            defaults={{
              name: user.name,
              school: user.school ?? "",
              department: user.department ?? "",
              avatarUrl: user.avatarUrl ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Нууц үг солих</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>
    </div>
  );
}
