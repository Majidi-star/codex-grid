import { prisma } from "@/lib/prisma";

export async function getActiveSprint() {
  const sprint = await prisma.sprint.findFirst({ where: { status: "active" } });
  if (!sprint) return null;
  if (new Date() > sprint.endDate) {
    return prisma.sprint.update({ where: { id: sprint.id }, data: { status: "completed" } });
  }
  return sprint;
}
