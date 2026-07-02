import { authenticate } from "../../middleware/authenticate.js";
import { prisma } from "../../db/prisma.js";
import { errorResponse } from "../../types/index.js";

/** Allow only super admins. */
export function requireSuperAdmin(
  req: Parameters<typeof authenticate>[0],
  res: Parameters<typeof authenticate>[1],
  next: Parameters<typeof authenticate>[2],
) {
  if (!req.user?.roles.includes("super_admin" as never)) {
    return res.status(403).json(errorResponse("FORBIDDEN", "Akses ditolak."));
  }
  next();
}

/** Allow tenant LMS admins (or super admins) for the `:tenantId` in the route. */
export async function requireLmsAdmin(
  req: Parameters<typeof authenticate>[0],
  res: Parameters<typeof authenticate>[1],
  next: Parameters<typeof authenticate>[2],
) {
  const { tenantId } = req.params;
  const userId = req.user?.id;
  if (!userId || !tenantId) return res.status(403).json(errorResponse("FORBIDDEN", "Akses ditolak."));
  const isSuperAdmin = req.user?.roles.includes("super_admin" as never);
  if (isSuperAdmin) return next();
  const role = await prisma.userRole.findFirst({
    where: { userId, role: "lms_admin", tenantId },
  });
  if (!role) return res.status(403).json(errorResponse("FORBIDDEN", "Akses ditolak."));
  next();
}
