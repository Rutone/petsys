import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Файл хавсаргалт (q16). Локал диск рүү (public/uploads) хадгална.
// ТЭМДЭГЛЭЛ: Vercel serverless дээр диск тогтворгүй тул production-д
// Vercel Blob / S3 руу залгахад энэ функцийг солино.

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
