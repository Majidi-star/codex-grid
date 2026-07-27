import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { restoreSprint, deleteSprintPermanently } from "@/lib/actions/sprint";

export default async function SprintsTrashPage() {
  const sprints = await prisma.sprint.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recycle Bin</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sprints here will be automatically deleted after 30 days.</p>
        </div>
        <Link
          href="/sprints"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 font-medium rounded-lg transition"
        >
          Back to Sprints
        </Link>
      </div>

      {sprints.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Recycle Bin is empty</h3>
          <p className="text-gray-500">No deleted sprints found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.map((sprint) => {
            const northStar = sprint.northStars[0]?.statement || "No North Star set";
            const daysLogged = sprint._count.dailyLogs;

            return (
              <div
                key={sprint.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full transition hover:shadow-md opacity-75"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    Deleted
                  </span>
                  <span className="text-xs text-gray-500">
                    Trashed {formatDistanceToNow(new Date(sprint.deletedAt!), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-3">
                    {northStar}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Created {format(new Date(sprint.createdAt), "MMM d, yyyy")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress Before Deletion</span>
                      <span>{daysLogged} / 84 Days</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <form action={restoreSprint.bind(null, sprint.id)} className="flex-1">
                      <button
                        type="submit"
                        className="w-full text-center px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 dark:text-brand-300 font-medium rounded-lg transition"
                      >
                        Restore
                      </button>
                    </form>
                    <form action={deleteSprintPermanently.bind(null, sprint.id)} className="flex-1">
                      <button
                        type="submit"
                        className="w-full text-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-300 font-medium rounded-lg transition"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
