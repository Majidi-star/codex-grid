"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function completeSprint(id: string) {
  const record = await prisma.sprint.update({
    where: { id },
    data: { status: "completed" }
  });
  revalidatePath("/");
  return record;
}

export async function createSprint(input: { sprintName: string; northStar: string }) {
  // Deactivate any existing active sprint just in case
  await prisma.sprint.updateMany({
    where: { status: "active" },
    data: { status: "completed" }
  });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 84); // 12 weeks

  const record = await prisma.sprint.create({
    data: {
      status: "active",
      startDate,
      endDate,
      northStars: {
        create: {
          statement: input.northStar,
          version: 1,
          isActive: true
        }
      }
    }
  });

  revalidatePath("/");
  return record;
}
