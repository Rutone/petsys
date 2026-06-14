"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { signIn, signOut } from "@/auth";
import { currentUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { USER_TYPES } from "@/lib/labels";

export type FormState = { error?: string; success?: string } | null;

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Нэрээ зөв оруулна уу.").max(100, "Нэр хэт урт байна."),
    userType: z.enum(USER_TYPES, { message: "Хэрэглэгчийн төрлөө сонгоно уу." }),
    code: z
      .string()
      .trim()
      .min(3, "Кодоо оруулна уу.")
      .max(30, "Код хэт урт байна."),
    email: z.string().trim().toLowerCase().email("Имэйл хаяг буруу байна."),
    password: z.string().min(1, "Нууц үгээ оруулна уу."),
    passwordConfirm: z.string(),
    school: z.string().trim().max(150).optional(),
    department: z.string().trim().max(150).optional(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Нууц үг таарахгүй байна.",
    path: ["passwordConfirm"],
  });

function generateCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function createAndSendCode(userId: string, email: string) {
  await prisma.verificationCode.deleteMany({ where: { userId } });
  const code = generateCode();
  await prisma.verificationCode.create({
    data: { userId, code, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
  });
  await sendVerificationEmail(email, code);
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const limited = await rateLimit("register", 5, 60 * 60 * 1000);
  if (!limited.ok) return { error: limited.error };

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    userType: formData.get("userType"),
    code: formData.get("code"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    school: formData.get("school") ?? undefined,
    department: formData.get("department") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Талбаруудаа шалгана уу." };
  }
  const { name, userType, email, password, school, department } = parsed.data;
  const code = parsed.data.code.toUpperCase();

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return { error: "Энэ имэйл хаягаар аль хэдийн бүртгүүлсэн байна." };

  const existingCode = await prisma.user.findUnique({ where: { code } });
  if (existingCode) return { error: "Энэ кодоор аль хэдийн бүртгүүлсэн байна." };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      userType,
      code,
      email,
      passwordHash,
      school: school || null,
      department: department || null,
    },
  });

  await createAndSendCode(user.id, email);
  redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
}

const verifySchema = z.object({
  email: z.string().trim().toLowerCase().email("Имэйл хаяг буруу байна."),
  code: z.string().trim().regex(/^\d{6}$/, "Код 6 оронтой тоо байна."),
});

export async function verifyEmail(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = verifySchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Талбаруудаа шалгана уу." };
  }
  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Энэ имэйлээр бүртгэл олдсонгүй." };
  if (user.emailVerified) redirect("/auth/login?verified=1");

  const valid = await prisma.verificationCode.findFirst({
    where: { userId: user.id, code, expiresAt: { gt: new Date() } },
  });
  if (!valid) return { error: "Код буруу эсвэл хугацаа нь дууссан байна." };

  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
  await prisma.verificationCode.deleteMany({ where: { userId: user.id } });

  redirect("/auth/login?verified=1");
}

export async function resendCode(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email) return { error: "Имэйл хаягаа оруулна уу." };

  const limited = await rateLimit("resend", 5, 60 * 60 * 1000);
  if (!limited.ok) return { error: limited.error };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Энэ имэйлээр бүртгэл олдсонгүй." };
  if (user.emailVerified) return { error: "Имэйл аль хэдийн баталгаажсан байна." };

  await createAndSendCode(user.id, email);
  return { success: "Шинэ код илгээлээ. Имэйлээ (dev горимд сервер консолоо) шалгана уу." };
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Имэйл, нууц үгээ оруулна уу." };

  const limited = await rateLimit("login", 10, 10 * 60 * 1000);
  if (!limited.ok) return { error: limited.error };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.isBlocked) return { error: "Таны бүртгэлийг түр хаасан байна. Админд хандана уу." };

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Имэйл эсвэл нууц үг буруу байна." };
    }
    throw error;
  }
  return null;
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

// ---- Нууц үг сэргээх (q5) ----

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email) return { error: "Имэйл хаягаа оруулна уу." };

  const limited = await rateLimit("pwreset", 5, 60 * 60 * 1000);
  if (!limited.ok) return { error: limited.error };

  const user = await prisma.user.findUnique({ where: { email } });
  // Имэйл бүртгэлтэй эсэхийг задлахгүйн тулд үргэлж амжилттай мессеж буцаана
  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const base = process.env.APP_URL ?? "http://localhost:3000";
    await sendPasswordResetEmail(email, `${base}/auth/reset?token=${token}`);
  }
  return {
    success: "Хэрэв энэ имэйл бүртгэлтэй бол сэргээх холбоос илгээгдсэн. Имэйлээ (dev горимд консолоо) шалгана уу.",
  };
}

const resetSchema = z
  .object({
    token: z.string().min(10, "Холбоос буруу байна."),
    password: z.string().min(1, "Шинэ нууц үгээ оруулна уу."),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Нууц үг таарахгүй байна.",
    path: ["passwordConfirm"],
  });

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Талбаруудаа шалгана уу." };
  }

  const row = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { error: "Холбоос хүчингүй эсвэл хугацаа нь дууссан байна." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { id: row.userId }, data: { passwordHash } });
  await prisma.passwordResetToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });

  redirect("/auth/login?reset=1");
}

// ---- Профайл засах (q6) ----

const profileSchema = z.object({
  name: z.string().trim().min(2, "Нэрээ зөв оруулна уу.").max(100),
  school: z.string().trim().max(150).optional(),
  department: z.string().trim().max(150).optional(),
  avatarUrl: z.string().trim().url("Зургийн URL буруу байна.").max(500).optional().or(z.literal("")),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await currentUser();
  if (!me) return { error: "Эхлээд нэвтэрнэ үү." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    school: formData.get("school") ?? undefined,
    department: formData.get("department") ?? undefined,
    avatarUrl: formData.get("avatarUrl") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Талбаруудаа шалгана уу." };
  }

  await prisma.user.update({
    where: { id: me.id },
    data: {
      name: parsed.data.name,
      school: parsed.data.school || null,
      department: parsed.data.department || null,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });
  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: "Профайл шинэчлэгдлээ." };
}

const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Одоогийн нууц үгээ оруулна уу."),
    password: z.string().min(1, "Шинэ нууц үгээ оруулна уу."),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Шинэ нууц үг таарахгүй байна.",
    path: ["passwordConfirm"],
  });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await currentUser();
  if (!me) return { error: "Эхлээд нэвтэрнэ үү." };

  const parsed = passwordChangeSchema.safeParse({
    current: formData.get("current"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Талбаруудаа шалгана уу." };
  }

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) return { error: "Хэрэглэгч олдсонгүй." };
  const ok = await bcrypt.compare(parsed.data.current, user.passwordHash);
  if (!ok) return { error: "Одоогийн нууц үг буруу байна." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { id: me.id }, data: { passwordHash } });
  return { success: "Нууц үг амжилттай солигдлоо." };
}
