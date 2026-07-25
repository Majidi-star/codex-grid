import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

export default async function SprintsPage() {
  const sprints = await prisma.sprint.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      northStars: {
        where: { isActive: true },
        take: 1
      },
      _count: {
        select: { dailyLogs: true }
      }
    }
  });

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Sprints</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and review your past and active sprints.</p>
        </div>
        <Link
          href="/sprint/new"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition"
        >
          Initialize New Sprint
        </Link>
      </div>

      {sprints.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sprints found</h3>
          <p className="text-gray-500">You haven&apos;t initialized any 12-week sprints yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.map((sprint) => {
            const isActive = sprint.status === "active";
            const northStar = sprint.northStars[0]?.statement || "No North Star set";
            const daysLogged = sprint._count.dailyLogs;
            const progressPercent = Math.min(Math.round((daysLogged / 84) * 100), 100);

            return (
              <div
                key={sprint.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6 flex flex-col h-full transition hover:shadow-md ${
                  isActive ? "border-brand-500 ring-1 ring-brand-500/50" : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    isActive 
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}>
                    {isActive ? "Active" : "Completed"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(sprint.startDate), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-3">
                    {northStar}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {formatDistanceToNow(new Date(sprint.createdAt), { addSuffix: true })}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{daysLogged} / 84 Days</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${isActive ? "bg-brand-500" : "bg-gray-500"}`} 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {isActive ? (
                    <Link
                      href="/"
                      className="block w-full text-center px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 dark:text-brand-300 font-medium rounded-lg transition"
                    >
                      Continue Sprint
                    </Link>
                  ) : (
                    <Link
                      href={`/sprint/archive/${sprint.id}`}
                      className="block w-full text-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium rounded-lg transition"
                    >
                      View Archive Stats
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
