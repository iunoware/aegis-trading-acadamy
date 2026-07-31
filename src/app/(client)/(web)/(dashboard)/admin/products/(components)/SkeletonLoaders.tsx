"use client";

import React from "react";

export function TableSkeleton({ columnsCount = 6, rowsCount = 5 }: { columnsCount?: number; rowsCount?: number }) {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs animate-pulse">
      {/* Search and filter toolbar skeleton */}
      <div className="px-6 py-4 border-b border-gray-100/50 dark:border-zinc-800/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="h-10 bg-gray-100 dark:bg-zinc-800/50 rounded-xl w-64" />
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="h-10 bg-gray-100 dark:bg-zinc-800/50 rounded-xl w-32" />
          <div className="h-10 bg-gray-100 dark:bg-zinc-800/50 rounded-xl w-32" />
        </div>
      </div>

      {/* Table grid skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-zinc-800">
              {Array.from({ length: columnsCount }).map((_, i) => (
                <th key={i} className="p-4.5">
                  <div className="h-4 bg-gray-250 dark:bg-zinc-850 rounded-md w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowsCount }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-50 dark:border-zinc-900 last:border-0">
                {Array.from({ length: columnsCount }).map((_, colIndex) => (
                  <td key={colIndex} className="p-4.5">
                    {colIndex === 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-150 dark:bg-zinc-800 rounded-lg shrink-0" />
                        <div className="h-3.5 bg-gray-100 dark:bg-zinc-850 rounded-md w-28" />
                      </div>
                    ) : colIndex === columnsCount - 1 ? (
                      <div className="flex gap-2">
                        <div className="h-8 w-12 bg-gray-100 dark:bg-zinc-850 rounded-lg" />
                        <div className="h-8 w-8 bg-gray-100 dark:bg-zinc-850 rounded-lg" />
                      </div>
                    ) : (
                      <div className="h-3.5 bg-gray-100 dark:bg-zinc-850 rounded-md w-20" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6.5 animate-pulse">
      {/* Form header skeleton */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col gap-2">
          <div className="h-7 bg-gray-200 dark:bg-zinc-800 rounded-lg w-48" />
          <div className="h-4 bg-gray-100 dark:bg-zinc-850 rounded-lg w-72" />
        </div>
        <div className="h-10 bg-gray-250 dark:bg-zinc-800 rounded-xl w-24" />
      </div>

      {/* Sections skeletons */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6.5">
          <div className="h-5 bg-gray-250 dark:bg-zinc-850 rounded-md w-36 mb-6" />
          
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-md w-24 mb-2" />
                <div className="h-10 bg-gray-100 dark:bg-zinc-800/50 rounded-xl w-full" />
              </div>
              <div>
                <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-md w-24 mb-2" />
                <div className="h-10 bg-gray-100 dark:bg-zinc-800/50 rounded-xl w-full" />
              </div>
            </div>
            
            <div>
              <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-md w-24 mb-2" />
              <div className="h-24 bg-gray-100 dark:bg-zinc-800/50 rounded-xl w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
