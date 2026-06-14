import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Сургалт", slug: "surgalt", order: 1 },
  { name: "Дотуур байр", slug: "dotuur-bair", order: 2 },
  { name: "Дэд бүтэц", slug: "ded-butets", order: 3 },
  { name: "Үйлчилгээ", slug: "uilchilgee", order: 4 },
  { name: "Цалин хөлс, хөдөлмөр", slug: "tsalin-hodolmor", order: 5 },
  { name: "Бусад", slug: "busad", order: 6 },
];

async function main() {
  const adminHash = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@must.edu.mn" },
    update: { role: "ADMIN", emailVerified: true, isActive: true },
    create: {
      name: "Систем админ",
      userType: "STAFF",
      code: "ADMIN001",
      email: "admin@must.edu.mn",
      passwordHash: adminHash,
      role: "ADMIN",
      emailVerified: true,
      department: "Мэдээллийн технологийн төв",
    },
  });

  const modHash = await bcrypt.hash("Mod123!", 10);
  await prisma.user.upsert({
    where: { email: "moderator@must.edu.mn" },
    update: { role: "MODERATOR", emailVerified: true, isActive: true },
    create: {
      name: "Модератор",
      userType: "STAFF",
      code: "MOD001",
      email: "moderator@must.edu.mn",
      passwordHash: modHash,
      role: "MODERATOR",
      emailVerified: true,
      department: "Оюутны хэрэг эрхлэх газар",
    },
  });

  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, order: c.order },
      create: c,
    });
  }

  console.log(`Seed дууслаа.`);
  console.log(`  Админ:     admin@must.edu.mn / Admin123!`);
  console.log(`  Модератор: moderator@must.edu.mn / Mod123!`);
  console.log(`  Категори:  ${CATEGORIES.length} ширхэг`);
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
