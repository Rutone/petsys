import type { SessionUser } from "@/lib/session";
import { PUBLIC_STATUSES } from "@/lib/labels";

// Audience targeting (q32): зорилтот бүлэгт нийцэх эсэх.
// ALL — бүгд; STUDENT/TEACHER/STAFF — зөвхөн тухайн төрөл (+ admin/moderator).
export function audienceWhere(user: SessionUser | null) {
  if (user && (user.role === "ADMIN" || user.role === "MODERATOR")) return {};
  if (!user) return { audience: "ALL" };
  return { audience: { in: ["ALL", user.userType] } };
}

export function canSeeAudience(user: SessionUser | null, audience: string): boolean {
  if (audience === "ALL") return true;
  if (!user) return false;
  if (user.role === "ADMIN" || user.role === "MODERATOR") return true;
  return user.userType === audience;
}

// Нийтэд харагдах статус + audience шүүлтийг нэгтгэсэн where (жагсаалтад)
export function publicListWhere(user: SessionUser | null) {
  return {
    status: { in: PUBLIC_STATUSES },
    ...audienceWhere(user),
  };
}
