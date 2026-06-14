# ШУТИС · Санал хураалын систем

ШУТИС-ийн оюутан, багш, ажилтнуудад зориулсан өргөдөл (petition) болон санал асуулгын (poll) веб систем. Front-end нь ШУТИС-ийн брэнд (navy + gold), оюутны вебээс санаа авсан sidebar дизайнтай.

## Боломжууд

- **3 төрлийн хэрэглэгч** — Оюутан / Багш / Ажилтан, тус бүр тусдаа кодтой. Имэйл 6 оронтой кодоор баталгаажна. Нууц үг сэргээх (forgot password) урсгалтай.
- **Профайл** — нэр, сургууль/тэнхим, зураг, нууц үг солих.
- **Өргөдөл** — категори, файл хавсралт (≤5MB), гарын үсэг цуглуулах/буцаах, зорилтот тооны явц, албан хариу, статусын урсгал (Хүлээгдэж буй → Идэвхтэй → Хэлэлцэж байгаа → Хэрэгжиж байгаа → Шийдвэрлэсэн → Хаагдсан), татгалзсан өргөдлийг засаад дахин илгээх.
- **Санал асуулга** — 2–8 сонголт, үр дүн хувиар, нэг хүн нэг санал.
- **Audience targeting** — багшийн асуулга зөвхөн багшид, ажилтных ажилтанд харагдана.
- **Сэтгэгдэл** — Like дарах боломжтой.
- **Мэдэгдэл** — сайт доторх 🔔 + имэйл (зөвшөөрсөн/татгалзсан, зорилтод хүрсэн г.м.).
- **Модерац** (модератор/админ) — зөвшөөрөх/татгалзах, статус удирдах, албан хариу, 72 цагийн SLA сануулга.
- **Админ** — статистик, хэрэглэгч удирдах (эрх, блок, идэвх), үйлдлийн түүх (audit log), CSV тайлан татах.
- **Dark mode**, бүрэн responsive, нэг хүн нэг л гарын үсэг/санал (DB unique constraint).

## Технологи

Next.js 16 (App Router) · TypeScript · Prisma 7 + SQLite · Auth.js (NextAuth v5) · Tailwind CSS 4 + shadcn/ui · zod · nodemailer · next-themes · lucide-react

## Ажиллуулах

```bash
npm install
npx prisma migrate dev   # DB үүсгэх
npx prisma db seed       # Админ, модератор, категори
npx tsx scripts/demo-data.ts  # (заавал биш) демо багш/ажилтан, өргөдөл, асуулга
npm run dev              # http://localhost:3000
```

### Туршилтын бүртгэлүүд

| Эрх | Имэйл | Нууц үг |
|---|---|---|
| Админ | admin@must.edu.mn | Admin123! |
| Модератор | moderator@must.edu.mn | Mod123! |
| Багш (demo) | teacher@must.edu.mn | Teacher123! |
| Ажилтан (demo) | staff@must.edu.mn | Staff123! |

> Dev горимд имэйл (баталгаажуулах код, нууц үг сэргээх холбоос, мэдэгдэл) нь жинхэнэ
> имэйл рүү илгээгдэхгүй, `npm run dev` ажиллаж буй **терминалын консол** дээр хэвлэгдэнэ.

## Production тохиргоо

`.env` дотор дараахыг тохируулна:

- `AUTH_SECRET` — Auth.js нууц түлхүүр (заавал)
- `APP_URL` — сайтын үндсэн URL (нууц үг сэргээх холбоост ашиглана)
- `DATABASE_URL` — SQLite (`file:./dev.db`) эсвэл PostgreSQL руу шилжүүлж болно
- **SMTP** (имэйл бодитоор илгээх): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_SECURE`

> Файл хавсралт нь `public/uploads`-д хадгалагдана. Vercel serverless дээр диск тогтворгүй тул
> production-д [src/lib/upload.ts](src/lib/upload.ts)-ийг Vercel Blob / S3 руу залгахыг зөвлөнө.

## Хугацааны төлөвлөгөө

- **2026-07** — багш, ажилтнуудад зориулсан pilot (~1000–1500 хэрэглэгч)
- **2026-09** — оюутан, багш, ажилтан бүгд

## Бүтэц

```
prisma/schema.prisma   — өгөгдлийн загвар (User, Petition, Signature, Poll, Vote, Comment,
                          CommentLike, Category, Attachment, Notification, AuditLog, ...)
src/auth.ts            — NextAuth (credentials + JWT, role/userType)
src/actions/           — server actions (auth, petitions, polls, comments, admin, notifications)
src/lib/               — db, session, visibility (audience), notify, audit, email, upload, rate-limit
src/app/               — хуудсууд (petitions, polls, profile, admin, moderation, auth, privacy)
src/components/         — layout (app-shell), petitions, polls, comments, auth, ui
docs/requirements.md   — 62 шаардлагын шийдвэр
```
