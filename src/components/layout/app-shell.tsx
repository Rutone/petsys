"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  BarChart3,
  User as UserIcon,
  ShieldCheck,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell, type NotificationItem } from "@/components/notifications/notification-bell";
import { USER_TYPE_LABELS, ROLE_LABELS } from "@/lib/labels";

type ShellUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  userType: string;
  code: string;
  isVerified: boolean;
  avatarUrl?: string | null;
} | null;

const baseNav = [
  { href: "/", label: "Нүүр", icon: Home },
  { href: "/petitions", label: "Өргөдөл", icon: FileText },
  { href: "/polls", label: "Санал асуулга", icon: BarChart3 },
];

function Avatar({ user, size = 32 }: { user: NonNullable<ShellUser>; size?: number }) {
  if (user.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={user.name ?? ""}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = (user.name ?? "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className="flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initial}
    </span>
  );
}

function NavLinks({ user, onNavigate }: { user: ShellUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = [...baseNav];
  if (user) items.push({ href: "/profile", label: "Миний хуудас", icon: UserIcon });
  if (user && (user.role === "MODERATOR" || user.role === "ADMIN"))
    items.push({ href: "/moderation", label: "Модерац", icon: ShieldCheck });
  if (user && user.role === "ADMIN")
    items.push({ href: "/admin", label: "Админ", icon: Settings });

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            }`}
          >
            <Icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/" className="block px-4 py-4">
      <Image
        src="/shutis-logo.png"
        alt="ШУТИС — Монгол Улсын Шинжлэх Ухаан Технологийн Их Сургууль"
        width={2255}
        height={396}
        priority
        className="h-auto w-full"
      />
      <div className="mt-1.5 text-center text-[11px] font-medium text-muted-foreground">
        Санал хураалын систем
      </div>
    </Link>
  );
}

function UserMenu({ user }: { user: NonNullable<ShellUser> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted"
      >
        <Avatar user={user} />
        <span className="hidden text-sm font-medium sm:block">{user.name}</span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border bg-popover shadow-lg">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {USER_TYPE_LABELS[user.userType]} · {user.code}
              {user.role !== "USER" && ` · ${ROLE_LABELS[user.role]}`}
            </p>
          </div>
          <div className="p-1">
            <Link href="/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">
              Миний хуудас
            </Link>
            <Link href="/profile/edit" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">
              Профайл засах
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Гарах
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({
  user,
  notifications,
  unread,
  today,
  children,
}: {
  user: ShellUser;
  notifications: NotificationItem[];
  unread: number;
  today: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto py-2">
          <NavLinks user={user} />
        </div>
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:underline">
            Нууцлалын бодлого
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                className="mr-3 flex size-9 items-center justify-center rounded-lg hover:bg-muted"
                aria-label="Хаах"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <NavLinks user={user} onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex size-9 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
              aria-label="Цэс"
            >
              <Menu className="size-5" />
            </button>
            <span className="hidden text-sm text-muted-foreground sm:block">{today}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {user && <NotificationBell items={notifications} unread={unread} />}
            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Нэвтрэх
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85"
                >
                  Бүртгүүлэх
                </Link>
              </div>
            )}
          </div>
        </header>

        {user && !user.isVerified && (
          <div className="border-b bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-800 dark:text-amber-300">
            Имэйл хаяг тань баталгаажаагүй байна —{" "}
            <Link
              href={`/auth/verify?email=${encodeURIComponent(user.email ?? "")}`}
              className="font-medium underline underline-offset-2"
            >
              баталгаажуулна уу
            </Link>
            .
          </div>
        )}

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>

        <footer className="border-t px-4 py-5 text-center text-sm text-muted-foreground">
          ШУТИС · Санал хураалын систем — {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
