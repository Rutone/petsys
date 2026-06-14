export const USER_TYPES = ["STUDENT", "TEACHER", "STAFF"] as const;
export type UserType = (typeof USER_TYPES)[number];

export const USER_TYPE_LABELS: Record<string, string> = {
  STUDENT: "Оюутан",
  TEACHER: "Багш",
  STAFF: "Ажилтан",
};

export const USER_TYPE_CODE_LABELS: Record<string, string> = {
  STUDENT: "Оюутны код",
  TEACHER: "Багшийн код",
  STAFF: "Ажилтны код",
};

export const ROLE_LABELS: Record<string, string> = {
  USER: "Хэрэглэгч",
  MODERATOR: "Модератор",
  ADMIN: "Админ",
};

// Petition / Poll статусууд
export const STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  DISCUSSING: "DISCUSSING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Хүлээгдэж буй",
  APPROVED: "Идэвхтэй",
  REJECTED: "Татгалзсан",
  DISCUSSING: "Хэлэлцэж байгаа",
  IN_PROGRESS: "Хэрэгжиж байгаа",
  RESOLVED: "Шийдвэрлэсэн",
  CLOSED: "Хаагдсан",
};

// Нийтэд (зөвшөөрөгдсөн) харагдах статусууд
export const PUBLIC_STATUSES = [
  "APPROVED",
  "DISCUSSING",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

// Гарын үсэг идэвхтэй цуглуулж буй статусууд
export const SIGNABLE_STATUSES = ["APPROVED", "DISCUSSING"];

// Admin/Moderator petition-ий статусыг шилжүүлж болох сонголтууд
export const PETITION_STATUS_FLOW = [
  "APPROVED",
  "DISCUSSING",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export const AUDIENCE_LABELS: Record<string, string> = {
  ALL: "Бүгд",
  STUDENT: "Зөвхөн оюутан",
  TEACHER: "Зөвхөн багш",
  STAFF: "Зөвхөн ажилтан",
};

export function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function formatDateTime(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(date)} ${h}:${min}`;
}

// "3 хоногийн өмнө" маягийн харьцангуй хугацаа
export function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "саяхан";
  if (mins < 60) return `${mins} минутын өмнө`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} цагийн өмнө`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} хоногийн өмнө`;
  return formatDate(date);
}

// Үлдсэн хугацаа (closesAt/endsAt хүртэл)
export function timeLeft(date: Date): string | null {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  if (days >= 1) return `${days} хоног үлдсэн`;
  const hours = Math.floor(diff / 3600000);
  if (hours >= 1) return `${hours} цаг үлдсэн`;
  const mins = Math.floor(diff / 60000);
  return `${mins} минут үлдсэн`;
}
