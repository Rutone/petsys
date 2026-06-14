// Turso (эсвэл libSQL) DB-д бүх хүснэгтийг үүсгэнэ — нэгдсэн prisma/schema.sql ажиллуулна.
// (Энэ файлыг шинэчлэхдээ:  npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script -o prisma/schema.sql)
//
// Ажиллуулах (Turso):
//   PowerShell:
//     $env:DATABASE_URL="libsql://<...>.turso.io"; $env:TURSO_AUTH_TOKEN="<token>"
//     npx tsx scripts/apply-schema.ts
//   Дараа нь:  npm run db:seed     (админ, модератор, категори)
import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL тохируулаагүй байна.");

  const sqlPath = path.join(process.cwd(), "prisma", "schema.sql");
  if (!fs.existsSync(sqlPath)) throw new Error("prisma/schema.sql олдсонгүй.");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  console.log("→ Схем суулгаж байна...");
  await client.executeMultiple(sql);
  console.log("✓ Схем амжилттай суулгалаа. Дараа нь: npm run db:seed");
}

main().catch((e) => {
  console.error("Алдаа:", e);
  process.exit(1);
});
