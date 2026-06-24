import { Resend } from "resend";
import { env } from "../../config/env.js";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
}

async function send(to: string, subject: string, html: string) {
  const client = getClient();
  if (!client) {
    console.log(`[email:dev] To: ${to} | Subject: ${subject}`);
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
