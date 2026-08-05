import { prisma } from "../lib/prisma";
import { CreateBannerInput, UpdateBannerInput } from "../validators/bannerValidators";

export async function listBanners(activeOnly = false) {
  return prisma.banner.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getBanner(id: string) {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) throw new Error("Banner not found");
  return banner;
}

export async function createBanner(data: CreateBannerInput) {
  return prisma.banner.create({ data });
}

export async function updateBanner(id: string, data: UpdateBannerInput) {
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) throw new Error("Banner not found");
  return prisma.banner.update({ where: { id }, data });
}

export async function deleteBanner(id: string) {
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) throw new Error("Banner not found");
  await prisma.banner.delete({ where: { id } });
}
