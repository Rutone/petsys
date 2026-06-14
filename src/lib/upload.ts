import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Файл хавсаргалт (q16).
//   Production (Vercel): BLOB_READ_WRITE_TOKEN тохируулсан бол Vercel Blob руу хадгална.
//   Local dev: токен байхгүй бол public/uploads локал диск рүү хадгална.

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES = 3;
export const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export type SavedFile = { url: string; filename: string; mimeType: string; size: number };

export async function saveUpload(file: File): Promise<SavedFile> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Файл хэт том байна (дээд хэмжээ ${MAX_FILE_SIZE / 1024 / 1024}MB).`);
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("Зөвхөн зураг (PNG/JPG/WEBP/GIF) болон PDF хавсаргах боломжтой.");
  }

  const ext = path.extname(file.name) || "";
  const safe = `${randomUUID()}${ext}`;

  // Vercel Blob (production)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${safe}`, file, {
      access: "public",
      contentType: file.type,
    });
    return { url: blob.url, filename: file.name, mimeType: file.type, size: file.size };
  }

  // Локал диск (dev). Production-д Blob тохируулаагүй бол алдаа өгнө.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Файл хавсаргах үйлчилгээ одоогоор боломжгүй байна. Дараа дахин оролдоно уу.");
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, safe), buffer);

  return {
    url: `/uploads/${safe}`,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  };
}
