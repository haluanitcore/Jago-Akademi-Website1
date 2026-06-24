import { prisma } from "../../db/prisma.js";
import { AppError } from "../../types/index.js";

export type CouponValidationResult = {
  couponId: string;
  code: string;
  discountAmount: number;
  finalAmount: number;
};

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) throw new AppError(404, "Kode kupon tidak valid.");

  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) throw new AppError(400, "Kupon belum aktif.");
  if (coupon.endDate && coupon.endDate < now) throw new AppError(400, "Kupon sudah kadaluarsa.");
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError(400, "Kupon sudah mencapai batas penggunaan.");
  }

  const minPurchase = Number(coupon.minPurchase);
  if (subtotal < minPurchase) {
    throw new AppError(400, `Minimum pembelian Rp ${minPurchase.toLocaleString("id-ID")} untuk kupon ini.`);
  }

  let discountAmount: number;
  if (coupon.type === "percentage") {
    discountAmount = Math.floor((subtotal * Number(coupon.value)) / 100);
    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
    }
  } else {
    discountAmount = Math.min(Number(coupon.value), subtotal);
  }

  return {
    couponId: coupon.id,
    code: coupon.code,
    discountAmount,
    finalAmount: subtotal - discountAmount,
  };
}

export async function incrementCouponUsage(couponId: string) {
  await prisma.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  });
}
