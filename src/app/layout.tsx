import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { formatDateTime } from "@/lib/labels";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ШУТИС · Санал хураалын систем",
    template: "%s | ШУТИС Санал хураал",
  },
  description:
    "ШУТИС-ийн оюутан, багш, ажилтнуудын өргөдөл гаргах, гарын үсэг цуглуулах, санал асуулга явуулах систем",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sessionUser = await currentUser();

  let shellUser = null;
  let notifications: {
    id: string;
    title: string;
    body: string;
    link: string | null;
    read: boolean;
    createdAt: string;
  }[] = [];
  let unread = 0;

  if (sessionUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { avatarUrl: true },
    });
    shellUser = { ...sessionUser, avatarUrl: dbUser?.avatarUrl ?? null };

    const [items, count] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: sessionUser.id },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      prisma.notification.count({ where: { userId: sessionUser.id, read: false } }),
    ]);
    notifications = items.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      link: n.link,
      read: n.read,
      createdAt: formatDateTime(n.createdAt),
    }));
    unread = count;
  }

  const today = new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());

  return (
    <html lang="mn" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <ThemeProvider>
          <AppShell user={shellUser} notifications={notifications} unread={unread} today={today}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
