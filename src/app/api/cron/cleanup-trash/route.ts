import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteSprintPermanently } from "@/lib/actions/sprint";

export async function GET(request: Request) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sprintsToDelete = await prisma.sprint.findMany({
      where: {
        deletedAt: {
          lte: thirtyDaysAgo
        }
      }
    });

    if (sprintsToDelete.length === 0) {
      return NextResponse.json({ message: "No sprints to delete." });
    }

    // Delete them permanently
    for (const sprint of sprintsToDelete) {
      await deleteSprintPermanently(sprint.id);
    }

    return NextResponse.json({
      message: `Successfully deleted ${sprintsToDelete.length} sprint(s) from the recycle bin.`,
      deletedCount: sprintsToDelete.length
    });
  } catch (error: any) {
    console.error("Failed to cleanup trash:", error);
    return NextResponse.json({ error: "Failed to cleanup trash." }, { status: 500 });
  }
}
