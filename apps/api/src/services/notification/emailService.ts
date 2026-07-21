import { Resend } from "resend";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
}

async function send(to: string, subject: string, html: string) {
  const client = getClient();
  if (!client) {
    logger.info("email not sent — RESEND_API_KEY unset", { to, subject });
    return;
  }
  await client.emails.send({
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

export async function sendPaymentSuccess(to: string, name: string, orderId: string, courseName: string, amount: number) {
  await send(
    to,
    `Pembayaran Berhasil — ${courseName}`,
    `<p>Halo <b>${name}</b>,</p>
     <p>Pembayaran Anda untuk kursus <b>${courseName}</b> sebesar <b>Rp ${amount.toLocaleString("id-ID")}</b> telah berhasil dikonfirmasi.</p>
     <p>Order ID: <code>${orderId}</code></p>
     <p>Silakan login dan mulai belajar: <a href="${env.WEB_URL}/belajar">Mulai Belajar</a></p>
     <br><p>Salam,<br>Tim Jago Akademi</p>`
  );
}

export async function sendPaymentPending(to: string, name: string, orderId: string, amount: number, paymentUrl: string) {
  await send(
    to,
    "Selesaikan Pembayaran Anda — Jago Akademi",
    `<p>Halo <b>${name}</b>,</p>
     <p>Order Anda sebesar <b>Rp ${amount.toLocaleString("id-ID")}</b> sedang menunggu pembayaran.</p>
     <p>Order ID: <code>${orderId}</code></p>
     <p><a href="${paymentUrl}">Klik di sini untuk menyelesaikan pembayaran</a></p>
     <br><p>Salam,<br>Tim Jago Akademi</p>`
  );
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  await send(
    to,
    "Verifikasi Email Anda — Jago Akademi",
    `<p>Halo <b>${name}</b>,</p>
     <p>Terima kasih telah mendaftar di Jago Akademi. Klik tautan berikut untuk memverifikasi email Anda:</p>
     <p><a href="${env.WEB_URL}/verifikasi-email?token=${token}">Verifikasi Email</a></p>
     <p>Tautan ini berlaku selama 24 jam.</p>
     <br><p>Salam,<br>Tim Jago Akademi</p>`
  );
}

export async function sendEventFullRefund(to: string, name: string, orderId: string, eventName: string) {
  await send(
    to,
    `Kuota Event Penuh — Dana Dikembalikan | ${eventName}`,
    `<p>Halo <b>${name}</b>,</p>
     <p>Mohon maaf, kuota untuk event <b>${eventName}</b> ternyata sudah penuh saat pembayaran Anda dikonfirmasi.</p>
     <p>Pembayaran Anda akan <b>dikembalikan sepenuhnya (refund)</b> dan sedang kami proses.</p>
     <p>Order ID: <code>${orderId}</code></p>
     <br><p>Salam,<br>Tim Jago Akademi</p>`
  );
}

/**
 * Post-purchase onboarding email for Private Class courses. Sent from webhook
 * fulfillment alongside the payment-success email. Degrade-safe like all other
 * templates (no-op when RESEND_API_KEY is unset).
 */
export async function sendPrivateClassWelcome(
  to: string,
  params: {
    name: string;
    courseTitle: string;
    waGroupLink?: string | null;
    onboardingContact?: string | null;
    liveSchedule?: Date | null;
    orderId: string;
  },
) {
  const { name, courseTitle, waGroupLink, onboardingContact, liveSchedule, orderId } = params;
  // Fallback: official admin number when the course has no dedicated contact.
  const adminWa = onboardingContact || "6285283423737";
  // Re-wrap in `new Date` because the value may arrive as an ISO string after a
  // JSON round-trip through the BullMQ queue.
  const scheduleText = liveSchedule
    ? `${new Date(liveSchedule).toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      })} WIB`
    : null;

  await send(
    to,
    `Selamat Bergabung di Private Class — ${courseTitle}`,
    `<p>Halo <b>${name}</b>,</p>
     <p>Selamat! Anda resmi bergabung di Private Class <b>${courseTitle}</b>. Berikut langkah onboarding Anda:</p>
     <ol>
       <li><b>Konfirmasi data &amp; pembayaran</b> — admin kami akan memverifikasi data dan pembayaran Anda.</li>
       <li><b>Join grup mentoring</b> — ${
         waGroupLink
           ? `<a href="${waGroupLink}">Klik di sini untuk bergabung ke grup WhatsApp</a>.`
           : "tautan grup akan dikirimkan oleh admin kami."
       }</li>
       <li><b>Perkenalan mentor</b> — Anda akan diperkenalkan dengan mentor di dalam grup.</li>
       <li><b>Jadwal &amp; teknis</b> — ${
         scheduleText
           ? `sesi live pertama: <b>${scheduleText}</b>.`
           : "jadwal sesi akan diinformasikan di dalam grup."
       }</li>
     </ol>
     <p>Butuh bantuan? Hubungi admin kami di <a href="https://wa.me/${adminWa}">wa.me/${adminWa}</a></p>
     <p>Order ID: <code>${orderId}</code></p>
     <br><p>Salam,<br>Tim Jago Akademi</p>`
  );
}

export async function sendOrderInvoice(to: string, name: string, orderId: string) {
  await send(
    to,
    `Invoice Pesanan #${orderId.slice(0, 8).toUpperCase()} — Jago Akademi`,
    `<p>Halo <b>${name}</b>,</p>
     <p>Invoice untuk pesanan Anda dapat diunduh melalui tautan berikut:</p>
     <p><a href="${env.WEB_URL}/pesanan/${orderId}">Lihat dan Unduh Invoice</a></p>
     <br><p>Salam,<br>Tim Jago Akademi</p>`
  );
}
