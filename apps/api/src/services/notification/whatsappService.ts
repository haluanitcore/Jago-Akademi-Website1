import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";

export async function sendWhatsApp(phone: string, message: string) {
  if (!env.FONNTE_TOKEN) {
    logger.info("WhatsApp not sent — FONNTE_TOKEN unset", { phone });
    return;
  }

  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: env.FONNTE_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target: phone, message }),
  });

  if (!res.ok) {
    logger.error("Fonnte send failed", { phone, status: res.status, body: await res.text() });
  }
}

export async function notifyPaymentSuccess(phone: string, name: string, courseName: string) {
  const msg = `Halo ${name}! 🎉\n\nPembayaran kursus *${courseName}* telah berhasil dikonfirmasi.\n\nSilakan login dan mulai belajar di: ${env.WEB_URL}/belajar\n\nSalam,\nJago Akademi`;
  await sendWhatsApp(phone, msg);
}
