import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Имэйл" },
        password: { label: "Нууц үг", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.isBlocked) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      // role, emailVerified өөрчлөгдсөн бол session шинэчлэгдэж байхын тулд
      // хүсэлт бүрд DB-ээс уншина (SQLite, сургуулийн хэмжээнд хангалттай хурдан)
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            role: true,
            userType: true,
            emailVerified: true,
            name: true,
            code: true,
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.userType = dbUser.userType;
          token.emailVerified = dbUser.emailVerified;
          token.name = dbUser.name;
          token.code = dbUser.code;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role = (token.role as string) ?? "USER";
      session.user.userType = (token.userType as string) ?? "STUDENT";
      session.user.isVerified = Boolean(token.emailVerified);
      session.user.code = (token.code as string) ?? "";
      return session;
    },
  },
});
