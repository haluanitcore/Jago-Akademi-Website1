import { env } from "../../config/env.js";

export async function sendWhatsApp(phone: string, message: string) {
  if (!env.FONNTE_TOKEN) {
    console.log(`[wa:dev] To: ${phone} | Message: ${message}`);
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
    console.error("[wa] Fonnte send failed:", await res.text());
  }
}

export async function notifyPaymentSuccess(phone: string, name: string, courseName: string) {
  const msg = `Halo ${name}! 🎉\n\nPembayaran kursus *${courseName}* telah berhasil dikonfirmasi.\n\nSilakan login dan mulai belajar di: ${env.WEB_URL}/belajar\n\nSalam,\nJago Akademi`;
  await sendWhatsApp(phone, msg);
}
