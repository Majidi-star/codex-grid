import React from "react";
import { getActiveSprint } from "@/lib/sprint";
import { prisma } from "@/lib/prisma";
import { getActiveCodexLaws } from "@/lib/actions/codexLaw";
import { redirect } from "next/navigation";
import BlockMetrics from "@/components/block/BlockMetrics";
import GoalTrendChart from "@/components/block/GoalTrendChart";
import CodexTrendChart from "@/components/block/CodexTrendChart";
import BlockReflections from "@/components/block/BlockReflections";
import NorthStarReview from "@/components/block/NorthStarReview";
import PageGrid from "@/components/shared/PageGrid";

export default async function BlockPage({ params }: { params: { blockNumber: string } }) {
  const sprint = await getActiveSprint();
  if (!sprint) {
    redirect("/setup");
  }

  const blockNumber = parseInt(params.blockNumber, 10);
  if (isNaN(blockNumber) || (blockNumber !== 1 && blockNumber !== 2)) {
    redirect("/");
  }

  const endWeekNumber = blockNumber === 1 ? 6 : 12;
  
  // Check if end week summary exists
  const endWeekSummary = await prisma.weeklySummary.findUnique({
    where: {
      sprintId_weekNumber: { sprintId: sprint.id, weekNumber: endWeekNumber }
    }
  });

  const allSummaries = await prisma.weeklySummary.findMany({
    where: { sprintId: sprint.id },
    include: { goalProgress: true }
  });

  let sixWeekSummary = await prisma.sixWeekSummary.findUnique({
    where: {
      sprintId_blockNumber: { sprintId: sprint.id, blockNumber }
    }
  });

  const goals = await prisma.goal.findMany({
    where: { sprintId: sprint.id }
  });

  const activeNorthStar = await prisma.northStar.findFirst({
    where: { sprintId: sprint.id, isActive: true }
  });

  const codexLaws = await getActiveCodexLaws();

  if (!sixWeekSummary) {
    sixWeekSummary = await prisma.sixWeekSummary.create({
      data: { sprintId: sprint.id, blockNumber }
    });
  }

  return (
    <div className="max-w-5xl mx-auto py-8 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Block {blockNumber} (Weeks {blockNumber === 1 ? "1-6" : "7-12"})
      </h1>

      {!endWeekSummary && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200">
          <p className="font-medium">
            Week {endWeekNumber} hasn&apos;t been summarized yet — numbers below may be incomplete.
          </p>
        </div>
      )}

      <PageGrid
        sidebar={
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <BlockMetrics summary={sixWeekSummary} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <BlockReflections summary={sixWeekSummary} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <NorthStarReview summary={sixWeekSummary} originalNorthStar={activeNorthStar?.statement || ""} />
            </div>
          </>
        }
        main={
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <GoalTrendChart goals={goals} summaries={allSummaries} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <CodexTrendChart summaries={allSummaries} blockNumber={blockNumber} codexLaws={codexLaws} />
            </div>
          </>
        }
      />
    </div>
  );
}
