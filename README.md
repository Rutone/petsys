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

Next.js 16 (App Router) · TypeScript · Prisma 7 + libSQL/Turso (SQLite) · Auth.js (NextAuth v5) · Tailwind CSS 4 + shadcn/ui · zod · nodemailer · @vercel/blob · next-themes · lucide-react

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

## Vercel дээр deploy хийх

Орчны хувьсагчдыг [.env.example](.env.example)-аас харна уу: `AUTH_SECRET`, `APP_URL`, `DATABASE_URL`,
`TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`, (заавал биш) `SMTP_*`.

1. **Turso DB үүсгэх** ([turso.tech](https://turso.tech)) → DB-ийн URL (`libsql://…`) ба auth token авах.
2. **Схем + seed суулгах** (нэг удаа, локалаас алсын Turso руу):
   ```bash
   # PowerShell:
   $env:DATABASE_URL="libsql://<...>.turso.io"; $env:TURSO_AUTH_TOKEN="<token>"
   npx tsx scripts/apply-schema.ts   # хүснэгтүүд үүсгэх
   npm run db:seed                   # админ, модератор, категори
   ```
3. **Vercel** дээр GitHub repo-г import хийх → Environment Variables-д дээрх утгуудыг оруулах.
4. **Vercel Blob** store нэмэх (Storage таб) → `BLOB_READ_WRITE_TOKEN` автоматаар тохирно (файл хавсралтад).
5. Deploy → `https://<project>.vercel.app`.

> Файл хавсралт: `BLOB_READ_WRITE_TOKEN` тохируулсан бол Vercel Blob, эс бөгөөс (dev) `public/uploads`
> локал дискэнд хадгална — [src/lib/upload.ts](src/lib/upload.ts).

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
