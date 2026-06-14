import { auth } from "@/auth";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  userType: string;
  isVerified: boolean;
  code: string;
};

export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

export function isModerator(user: SessionUser | null): boolean {
  return user?.role === "MODERATOR" || user?.role === "ADMIN";
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "ADMIN";
}

// Server action дотор ашиглана. Шалгалт: if ("error" in guard) return ...
export async function requireVerifiedUser(): Promise<
  { user: SessionUser } | { error: string }
> {
  const user = await currentUser();
  if (!user) return { error: "Эхлээд нэвтэрнэ үү." };
  if (!user.isVerified)
    return { error: "Имэйл хаягаа баталгаажуулсны дараа энэ үйлдлийг хийх боломжтой." };
  return { user };
}

export async function requireModerator(): Promise<{ user: SessionUser } | { error: string }> {
  const user = await currentUser();
  if (!isModerator(user)) return { error: "Хандах эрхгүй." };
  return { user: user! };
}

export async function requireAdmin(): Promise<{ user: SessionUser } | { error: string }> {
  const user = await currentUser();
  if (!isAdmin(user)) return { error: "Хандах эрхгүй." };
  return { user: user! };
}
