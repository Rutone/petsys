// Turso (эсвэл libSQL) DB-д Prisma migration SQL-ийг шууд ажиллуулж хүснэгтүүдийг үүсгэнэ.
// Prisma migrate ашиглахгүйгээр алсын Turso DB-г бэлдэхэд зориулсан.
//
// Ажиллуулах (Turso):
//   $env:DATABASE_URL="libsql://<...>.turso.io"; $env:TURSO_AUTH_TOKEN="<token>"
//   npx tsx scripts/apply-schema.ts
//
// Дараа нь:  npm run db:seed   (админ, модератор, категори)
import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL тохируулаагүй байна.");

  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const dirs = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort(); // timestamp prefix → хронологийн дараалал

  for (const dir of dirs) {
    const sqlPath = path.join(migrationsDir, dir, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;
    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log(`→ ${dir} ажиллуулж байна...`);
    await client.executeMultiple(sql);
  }

  console.log("✓ Схем амжилттай суулгалаа.");
}

main().catch((e) => {
  console.error("Алдаа:", e);
  process.exit(1);
});
