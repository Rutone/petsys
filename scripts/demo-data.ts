// Туршилтын демо өгөгдөл. Ажиллуулах: npx tsx scripts/demo-data.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const teacherHash = await bcrypt.hash("Teacher123!", 10);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@must.edu.mn" },
    update: {},
    create: {
      name: "Тэст Багш",
      userType: "TEACHER",
      code: "T2024001",
      email: "teacher@must.edu.mn",
      passwordHash: teacherHash,
      emailVerified: true,
      school: "Мэдээлэл, холбооны технологийн сургууль",
      department: "Компьютерийн ухааны тэнхим",
    },
  });

  const staffHash = await bcrypt.hash("Staff123!", 10);
  const staff = await prisma.user.upsert({
    where: { email: "staff@must.edu.mn" },
    update: {},
    create: {
      name: "Тэст Ажилтан",
      userType: "STAFF",
      code: "S2024001",
      email: "staff@must.edu.mn",
      passwordHash: staffHash,
      emailVerified: true,
      department: "Санхүүгийн алба",
    },
  });

  const category = await prisma.category.findUnique({ where: { slug: "uilchilgee" } });

  await prisma.petition.upsert({
    where: { id: "demo-petition" },
    update: {},
    create: {
      id: "demo-petition",
      title: "Номын сангийн ажиллах цагийг 22:00 хүртэл сунгах",
      description:
        "Шалгалтын улиралд багш, ажилтнууд орой ажиллах шаардлагатай байдаг тул төв номын сангийн ажиллах цагийг ажлын өдрүүдэд 22:00 цаг хүртэл сунгахыг хүсэж байна.",
      goal: 50,
      status: "APPROVED",
      audience: "ALL",
      categoryId: category?.id,
      authorId: teacher.id,
    },
  });

  await prisma.poll.upsert({
    where: { id: "demo-poll" },
    update: {},
    create: {
      id: "demo-poll",
      question: "Багш нарын өрөөнд ямар тоног төхөөрөмж нэн тэргүүнд хэрэгтэй вэ?",
      description: "Зөвхөн багш нарт зориулсан санал асуулга.",
      status: "APPROVED",
      audience: "TEACHER",
      authorId: teacher.id,
      options: {
        create: [
          { text: "Шинэ принтер" },
          { text: "Проектор" },
          { text: "Кофе машин" },
          { text: "Эргономик сандал" },
        ],
      },
    },
  });

  console.log(`Демо өгөгдөл бэлэн:`);
  console.log(`  Багш:    teacher@must.edu.mn / Teacher123!`);
  console.log(`  Ажилтан: staff@must.edu.mn / Staff123!`);
  void staff;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
