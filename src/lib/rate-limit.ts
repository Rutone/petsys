// Энгийн санах ойн rate limiter (q50). Нэг процессод хадгална — pilot-ийн хэмжээнд
// хангалттай. Олон instance/serverless дээр Redis зэрэгт шилжүүлэх боломжтой.
import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export async function clientKey(scope: string): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

// limit удаа / windowMs хугацаанд. Хэтэрвэл false буцаана.
export function take(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

// Server action дотор ашиглах туслах: хэтэрсэн бол алдааны мессеж буцаана
export async function rateLimit(
  scope: string,
  limit: number,
  windowMs: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = await clientKey(scope);
  if (take(key, limit, windowMs)) return { ok: true };
  return {
    ok: false,
    error: "Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.",
  };
}
