// Имэйл илгээх давхарга.
//
// Production-д сургуулийн SMTP серверийг дараах орчны хувьсагчаар тохируулна (q49):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE
// Тохиргоо байхгүй (dev) үед имэйл серверийн консол руу хэвлэгдэнэ.

type SendArgs = { to: string; subject: string; text: string; html?: string };

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendEmail({ to, subject, text, html }: SendArgs) {
  if (!smtpConfigured()) {
    console.log(
      `\n======== [EMAIL · dev] ========\n` +
        `Хүлээн авагч: ${to}\n` +
        `Гарчиг: ${subject}\n` +
        `--------------------------------\n${text}\n` +
        `================================\n`
    );
    return;
  }

  // SMTP тохируулсан үед л nodemailer-ийг ачаална (dynamic import)
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

export async function sendVerificationEmail(email: string, code: string) {
  await sendEmail({
    to: email,
    subject: "ШУТИС Санал хураал — Имэйл баталгаажуулах код",
    text: `Таны баталгаажуулах код: ${code}\n\nЭнэ код 30 минутын дараа хүчингүй болно.`,
  });
}

export async function sendPasswordResetEmail(email: string, link: string) {
  await sendEmail({
    to: email,
    subject: "ШУТИС Санал хураал — Нууц үг сэргээх",
    text: `Нууц үгээ сэргээхийн тулд дараах холбоосоор орно уу:\n${link}\n\nЭнэ холбоос 60 минутын дараа хүчингүй болно. Хэрэв та хүсээгүй бол энэ имэйлийг үл тоомсорлоно уу.`,
  });
}
