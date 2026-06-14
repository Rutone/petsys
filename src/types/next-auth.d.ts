import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      userType: string;
      isVerified: boolean;
      code: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    userType?: string;
    emailVerified?: boolean;
    code?: string;
  }
}
