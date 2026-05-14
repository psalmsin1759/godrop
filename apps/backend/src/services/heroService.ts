import { prisma } from "../lib/prisma";
import { CreateHeroInput, UpdateHeroInput } from "../validators/heroValidators";

export async function listHeroes(activeOnly = false) {
  return prisma.hero.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getHero(id: string) {
  const hero = await prisma.hero.findUnique({ where: { id } });
  if (!hero) throw new Error("Hero not found");
  return hero;
}

export async function createHero(data: CreateHeroInput) {
  return prisma.hero.create({ data });
}

export async function updateHero(id: string, data: UpdateHeroInput) {
  const existing = await prisma.hero.findUnique({ where: { id } });
  if (!existing) throw new Error("Hero not found");
  return prisma.hero.update({ where: { id }, data });
}

export async function updateHeroImage(id: string, imageUrl: string) {
  const existing = await prisma.hero.findUnique({ where: { id } });
  if (!existing) throw new Error("Hero not found");
  return prisma.hero.update({ where: { id }, data: { imageUrl } });
}

export async function deleteHero(id: string) {
  const existing = await prisma.hero.findUnique({ where: { id } });
  if (!existing) throw new Error("Hero not found");
  await prisma.hero.delete({ where: { id } });
}
